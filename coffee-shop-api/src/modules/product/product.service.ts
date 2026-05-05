import type { DataSource, EntityManager } from 'typeorm';

import { createModuleLogger } from '@/config/logger';
import { Category } from '@/modules/category/category.entity';
import type { CategoryRepository } from '@/modules/category/category.repository';
import { PRODUCT_STATUS } from '@/shared/enums/product';
import { USER_ROLE } from '@/shared/enums/user';
import { VALIDATION_RULES } from '@/shared/constants/validation';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { BaseService } from '@/shared/services/base.service';
import type { PaginatedResponse } from '@/shared/types/response';
import { withRandomSkuSuffix } from '@/shared/utils/sku';
import { slugFrom } from '@/shared/utils/slug';
import { assignDefined } from '@/shared/utils/validation';

import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductImageInput,
  UpdateProductInput,
} from './product.dto';
import { Product } from './product.entity';
import { ProductImageRepository } from './product-image.repository';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import type { ProductRepository } from './product.repository';
import type { ProductVariantRepository } from './product-variant.repository';

const log = createModuleLogger('ProductService');
const variantNameFrom = (weight: number, unit: string): string => `${String(weight)}${unit}`;
const MAX_SKU_GENERATION_ATTEMPTS = 5;

export interface ProductServiceDeps {
  productRepo: ProductRepository;
  imageRepo: ProductImageRepository;
  variantRepo: ProductVariantRepository;
  categoryRepo: CategoryRepository;
  dataSource: DataSource;
}

export class ProductService extends BaseService<Product, ProductRepository> {
  private readonly imageRepo: ProductImageRepository;
  private readonly variantRepo: ProductVariantRepository;
  private readonly categoryRepo: CategoryRepository;

  constructor(dependencies: ProductServiceDeps) {
    super(dependencies.productRepo, dependencies.dataSource);
    this.imageRepo = dependencies.imageRepo;
    this.variantRepo = dependencies.variantRepo;
    this.categoryRepo = dependencies.categoryRepo;
  }

  findAll(
    query: ListProductsQuery,
    options?: { requesterRole?: USER_ROLE },
  ): Promise<PaginatedResponse<Product[]>> {
    return this.repository.findAll(query, options);
  }

  async findById(id: string): Promise<Product> {
    const full = await this.repository.findByIdWithRelations(id);
    if (!full) {
      throw new NotFoundError('Product');
    }

    return full;
  }

  async create(input: CreateProductInput, createdBy: string): Promise<Product> {
    log.info('Creating product', { name: input.name, createdBy });

    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError('Category');
    }

    const skus = input.variants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length) {
      throw new BadRequestError(ERROR_MESSAGES.PRODUCT.DUPLICATE_SKU_IN_REQUEST);
    }

    const slug = slugFrom(input.name);
    const existingBySlug = await this.repository.findBySlug(slug);
    if (existingBySlug) {
      throw new ConflictError(ERROR_MESSAGES.PRODUCT.SLUG_EXISTS);
    }

    const pendingSkus = new Set<string>();
    const variantsWithGeneratedSku: CreateProductInput['variants'] = [];
    for (const variant of input.variants) {
      variantsWithGeneratedSku.push({
        ...variant,
        sku: await this.generateUniqueVariantSku(variant.sku, pendingSkus),
      });
    }

    const product = this.repository.create({
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description ?? null,
      roastLevel: input.roastLevel,
      isOrganic: input.isOrganic,
      isFairTrade: input.isFairTrade,
      status: input.status,
      tastingNotes: input.tastingNotes ?? null,
      origin: input.origin ?? null,
      processingMethod: input.processingMethod ?? null,
      createdBy,
      updatedBy: null,
      deletedBy: null,
      variants: variantsWithGeneratedSku.map((v) =>
        this.variantRepo.create({
          ...v,
          name: variantNameFrom(v.weight, v.unit),
          createdBy,
          updatedBy: null,
          deletedBy: null,
        }),
      ),
      images: this.imageRepo.createMany(input.images),
    });

    const saved = await this.repository.save(product);

    log.info('Product created', {
      productId: saved.id,
      slug: saved.slug,
      variantCount: saved.variants?.length ?? 0,
      imageCount: saved.images?.length ?? 0,
      createdBy,
    });

    const full = await this.repository.findByIdWithRelations(saved.id);
    if (!full) {
      throw new NotFoundError('Product');
    }

    return full;
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    await this.assertById(id, 'Product');

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(ProductVariant)
        .set({ updatedBy: deletedBy, deletedBy })
        .where('product_id = :id AND deleted_at IS NULL', { id })
        .execute();

      await manager.softDelete(ProductVariant, { productId: id });
      await manager.softDelete(ProductImage, { productId: id });

      await manager
        .createQueryBuilder()
        .update(Product)
        .set({ status: PRODUCT_STATUS.ARCHIVED, updatedBy: deletedBy, deletedBy })
        .where('id = :id', { id })
        .execute();

      await manager.softDelete(Product, { id });
    });
  }

  async update(id: string, input: UpdateProductInput, updatedBy: string): Promise<Product> {
    log.info('Updating product', { id, updatedBy });

    await this.dataSource.transaction(async (manager) => {
      const product = await manager.getRepository(Product).findOne({ where: { id } });
      if (!product) throw new NotFoundError('Product');

      await this.applyScalarUpdates(manager, product, input);

      product.updatedBy = updatedBy;
      await manager.getRepository(Product).save(product);

      await this.applyImageMutations(manager, id, input);
    });

    const full = await this.repository.findByIdWithRelations(id);
    if (!full) {
      throw new NotFoundError('Product');
    }

    log.info('Product updated', {
      productId: id,
      slug: full.slug,
      imageCount: full.images?.length ?? 0,
      updatedBy,
    });

    return full;
  }

  private async generateUniqueVariantSku(
    baseSku: string,
    pendingSkus: Set<string>,
  ): Promise<string> {
    for (let attempt = 0; attempt < MAX_SKU_GENERATION_ATTEMPTS; attempt += 1) {
      const generatedSku = withRandomSkuSuffix(baseSku);
      if (pendingSkus.has(generatedSku)) {
        continue;
      }

      const existing = await this.variantRepo.findBySku(generatedSku);
      if (!existing) {
        pendingSkus.add(generatedSku);
        return generatedSku;
      }
    }

    throw new ConflictError(ERROR_MESSAGES.PRODUCT.SKU_EXISTS);
  }

  private async applyImageMutations(
    manager: EntityManager,
    productId: string,
    input: UpdateProductInput,
  ): Promise<void> {
    const { removeImageIds, updateImages, addImages } = input;

    const hasImageChanges =
      Boolean(removeImageIds?.length) ||
      Boolean(updateImages?.length) ||
      Boolean(addImages?.length);
    if (!hasImageChanges) {
      return;
    }

    const imageRepository = new ProductImageRepository(manager.getRepository(ProductImage));

    if (removeImageIds?.length) {
      const existing = await imageRepository.findByProductIdAndIds(productId, removeImageIds);
      if (existing.length !== removeImageIds.length) {
        const foundIds = new Set(existing.map((img) => img.id));
        const missing = removeImageIds.filter((imageId) => !foundIds.has(imageId));
        throw new BadRequestError(ERROR_MESSAGES.PRODUCT.INVALID_IMAGE_IDS(missing));
      }
      await imageRepository.deleteByIds(removeImageIds);
    }

    if (updateImages?.length) {
      const ids = updateImages.map((img) => img.id);
      const existing = await imageRepository.findByProductIdAndIds(productId, ids);
      if (existing.length !== ids.length) {
        const foundIds = new Set(existing.map((img) => img.id));
        const missing = ids.filter((imageId) => !foundIds.has(imageId));
        throw new BadRequestError(ERROR_MESSAGES.PRODUCT.INVALID_IMAGE_IDS(missing));
      }
      const byId = new Map(existing.map((img) => [img.id, img]));
      for (const patch of updateImages) {
        const target = byId.get(patch.id) as ProductImage;
        this.applyImagePatch(target, patch);
      }
      await imageRepository.saveMany(existing);
    }

    if (addImages?.length) {
      const created = imageRepository.createManyForProduct(addImages, productId);
      await imageRepository.saveMany(created);
    }

    const finalImages = await imageRepository.findByProductId(productId);
    if (finalImages.length > VALIDATION_RULES.PRODUCT.IMAGE.MAX_COUNT) {
      throw new BadRequestError(
        ERROR_MESSAGES.PRODUCT.TOO_MANY_IMAGES(VALIDATION_RULES.PRODUCT.IMAGE.MAX_COUNT),
      );
    }

    let seenPrimary = false;
    const hasMultiplePrimary = finalImages.some((img) => {
      if (!img.isPrimary) return false;
      if (seenPrimary) return true;
      seenPrimary = true;
      return false;
    });
    if (hasMultiplePrimary) {
      throw new BadRequestError(ERROR_MESSAGES.PRODUCT.MULTIPLE_PRIMARY_IMAGES);
    }
  }

  private applyImagePatch(target: ProductImage, patch: UpdateProductImageInput): void {
    if (patch.url !== undefined) target.url = patch.url;
    if (patch.isPrimary !== undefined) target.isPrimary = patch.isPrimary;
    if (patch.sortOrder !== undefined) target.sortOrder = patch.sortOrder;
  }

  private async applyScalarUpdates(
    manager: EntityManager,
    product: Product,
    input: UpdateProductInput,
  ): Promise<void> {
    if (input.categoryId !== undefined && input.categoryId !== product.categoryId) {
      const category = await manager
        .getRepository(Category)
        .findOne({ where: { id: input.categoryId } });
      if (!category) throw new NotFoundError('Category');
      product.categoryId = input.categoryId;
    }

    if (input.name !== undefined && input.name !== product.name) {
      const slug = slugFrom(input.name);
      const slugConflict = await manager
        .getRepository(Product)
        .createQueryBuilder('p')
        .where('p.slug = :slug AND p.id != :id', { slug, id: product.id })
        .getOne();
      if (slugConflict) {
        throw new ConflictError(ERROR_MESSAGES.PRODUCT.SLUG_EXISTS);
      }
      product.name = input.name;
      product.slug = slug;
    }

    assignDefined(product, {
      description: input.description,
      roastLevel: input.roastLevel,
      isOrganic: input.isOrganic,
      isFairTrade: input.isFairTrade,
      status: input.status,
      tastingNotes: input.tastingNotes,
      origin: input.origin,
      processingMethod: input.processingMethod,
    });
  }
}
