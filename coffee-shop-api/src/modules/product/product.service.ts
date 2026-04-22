import type { EntityManager, Repository } from 'typeorm';
import { In } from 'typeorm';

import AppDataSource from '@/config/database';
import { createModuleLogger } from '@/config/logger';
import { Category } from '@/modules/category/category.entity';
import { VALIDATION_RULES } from '@/shared/constants/validation';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { withRandomSkuSuffix } from '@/shared/utils/sku';
import { slugFrom } from '@/shared/utils/slug';
import { assertNoDuplicate } from '@/shared/utils/validation';
import type { PaginatedResponse } from '@/shared/types/response';

import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductImageInput,
  UpdateProductInput,
} from './product.dto';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

const log = createModuleLogger('ProductService');

const productRepo = (): Repository<Product> => AppDataSource.getRepository(Product);
const imageRepo = (): Repository<ProductImage> => AppDataSource.getRepository(ProductImage);
const variantRepo = (): Repository<ProductVariant> => AppDataSource.getRepository(ProductVariant);
const categoryRepo = (): Repository<Category> => AppDataSource.getRepository(Category);
const variantNameFrom = (weight: number, unit: string): string => `${String(weight)}${unit}`;
const MAX_SKU_GENERATION_ATTEMPTS = 5;

const assertProduct = async (id: string): Promise<Product> => {
  const product = await productRepo().findOne({ where: { id } });
  if (!product) {
    throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND('Product'));
  }
  return product;
};

const generateUniqueVariantSku = async (
  baseSku: string,
  pendingSkus: Set<string>,
): Promise<string> => {
  for (let attempt = 0; attempt < MAX_SKU_GENERATION_ATTEMPTS; attempt += 1) {
    const generatedSku = withRandomSkuSuffix(baseSku);
    if (pendingSkus.has(generatedSku)) {
      continue;
    }

    const existing = await variantRepo().findOne({ where: { sku: generatedSku } });
    if (!existing) {
      pendingSkus.add(generatedSku);
      return generatedSku;
    }
  }

  throw new ConflictError(ERROR_MESSAGES.PRODUCT.SKU_EXISTS);
};

export const createProduct = async (
  input: CreateProductInput,
  createdBy: string,
): Promise<Product> => {
  log.info('Creating product', { name: input.name, createdBy });

  const category = await categoryRepo().findOne({ where: { id: input.categoryId } });
  if (!category) throw new NotFoundError('Category');

  const skus = input.variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) {
    throw new BadRequestError(ERROR_MESSAGES.PRODUCT.DUPLICATE_SKU_IN_REQUEST);
  }

  const slug = slugFrom(input.name);
  await assertNoDuplicate(productRepo(), { slug }, ERROR_MESSAGES.PRODUCT.SLUG_EXISTS);

  const pendingSkus = new Set<string>();
  const variantsWithGeneratedSku: CreateProductInput['variants'] = [];
  for (const variant of input.variants) {
    variantsWithGeneratedSku.push({
      ...variant,
      sku: await generateUniqueVariantSku(variant.sku, pendingSkus),
    });
  }

  const product = productRepo().create({
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
      variantRepo().create({
        ...v,
        name: variantNameFrom(v.weight, v.unit),
        createdBy,
        updatedBy: null,
        deletedBy: null,
      }),
    ),
    images: input.images.map((image) => imageRepo().create(image)),
  });

  const saved = await productRepo().save(product);

  log.info('Product created', {
    productId: saved.id,
    slug: saved.slug,
    variantCount: saved.variants?.length ?? 0,
    imageCount: saved.images?.length ?? 0,
    createdBy,
  });

  const full = await productRepo().findOne({
    where: { id: saved.id },
    relations: ['variants', 'images'],
  });
  if (!full) {
    throw new NotFoundError('Product');
  }

  return full;
};

export const removeProduct = async (id: string, deletedBy: string): Promise<void> => {
  await assertProduct(id);

  await AppDataSource.transaction(async (manager) => {
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
      .set({ updatedBy: deletedBy, deletedBy })
      .where('id = :id', { id })
      .execute();

    await manager.softDelete(Product, { id });
  });
};

export const findProductById = async (id: string): Promise<Product> => {
  const full = await productRepo().findOne({
    where: { id },
    relations: ['variants', 'images'],
  });
  if (!full) {
    throw new NotFoundError('Product');
  }

  return full;
};

export const findAllProducts = async (
  query: ListProductsQuery,
): Promise<PaginatedResponse<Product[]>> => {
  const { page, limit, search, status, categoryId } = query;

  const qb = productRepo()
    .createQueryBuilder('product')
    .orderBy('product.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (status) qb.andWhere('product.status = :status', { status });

  if (categoryId) qb.andWhere('product.categoryId = :categoryId', { categoryId });

  if (search) {
    qb.andWhere('product.name ILIKE :search OR product.slug ILIKE :search', {
      search: `%${search}%`,
    });
  }

  const [data, totalCount] = await qb.getManyAndCount();
  if (data.length === 0) {
    return {
      data: [],
      meta: {
        limit,
        currentPage: page,
        pageCount: Math.ceil(totalCount / limit),
        totalCount,
      },
    };
  }

  const ids = data.map((item) => item.id);
  const fullData = await productRepo().find({
    where: { id: In(ids) },
    relations: ['variants', 'images'],
  });
  const order = new Map(ids.map((id, idx) => [id, idx]));
  fullData.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return {
    data: fullData,
    meta: {
      limit,
      currentPage: page,
      pageCount: Math.ceil(totalCount / limit),
      totalCount,
    },
  };
};

const applyImageMutations = async (
  manager: EntityManager,
  productId: string,
  input: UpdateProductInput,
): Promise<void> => {
  const { removeImageIds, updateImages, addImages } = input;

  const hasImageChanges =
    Boolean(removeImageIds?.length) || Boolean(updateImages?.length) || Boolean(addImages?.length);

  if (!hasImageChanges) return;

  const imageRepository = manager.getRepository(ProductImage);

  if (removeImageIds?.length) {
    const existing = await imageRepository.find({
      where: { productId, id: In(removeImageIds) },
    });
    if (existing.length !== removeImageIds.length) {
      const foundIds = new Set(existing.map((img) => img.id));
      const missing = removeImageIds.filter((x) => !foundIds.has(x));
      throw new BadRequestError(ERROR_MESSAGES.PRODUCT.INVALID_IMAGE_IDS(missing));
    }
    await imageRepository.delete({ id: In(removeImageIds) });
  }

  if (updateImages?.length) {
    const ids = updateImages.map((img) => img.id);
    const existing = await imageRepository.find({ where: { productId, id: In(ids) } });
    if (existing.length !== ids.length) {
      const foundIds = new Set(existing.map((img) => img.id));
      const missing = ids.filter((x) => !foundIds.has(x));
      throw new BadRequestError(ERROR_MESSAGES.PRODUCT.INVALID_IMAGE_IDS(missing));
    }
    const byId = new Map(existing.map((img) => [img.id, img]));
    for (const patch of updateImages) {
      const target = byId.get(patch.id) as ProductImage;
      applyImagePatch(target, patch);
    }
    await imageRepository.save(existing);
  }

  if (addImages?.length) {
    const created = addImages.map((img) => imageRepository.create({ ...img, productId }));
    await imageRepository.save(created);
  }

  const finalImages = await imageRepository.find({ where: { productId } });

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
};

const applyImagePatch = (target: ProductImage, patch: UpdateProductImageInput): void => {
  if (patch.url !== undefined) target.url = patch.url;
  if (patch.isPrimary !== undefined) target.isPrimary = patch.isPrimary;
  if (patch.sortOrder !== undefined) target.sortOrder = patch.sortOrder;
};

const applyScalarUpdates = async (
  manager: EntityManager,
  product: Product,
  input: UpdateProductInput,
): Promise<void> => {
  if (input.categoryId !== undefined && input.categoryId !== product.categoryId) {
    const category = await manager
      .getRepository(Category)
      .findOne({ where: { id: input.categoryId } });
    if (!category) throw new NotFoundError('Category');
    product.categoryId = input.categoryId;
  }

  if (input.name !== undefined && input.name !== product.name) {
    const slug = slugFrom(input.name);
    const slugConflict = await manager.getRepository(Product).findOne({ where: { slug } });
    if (slugConflict && slugConflict.id !== product.id) {
      throw new ConflictError(ERROR_MESSAGES.PRODUCT.SLUG_EXISTS);
    }
    product.name = input.name;
    product.slug = slug;
  }

  if (input.description !== undefined) product.description = input.description;
  if (input.roastLevel !== undefined) product.roastLevel = input.roastLevel;
  if (input.isOrganic !== undefined) product.isOrganic = input.isOrganic;
  if (input.isFairTrade !== undefined) product.isFairTrade = input.isFairTrade;
  if (input.status !== undefined) product.status = input.status;
  if (input.tastingNotes !== undefined) product.tastingNotes = input.tastingNotes;
  if (input.origin !== undefined) product.origin = input.origin;
  if (input.processingMethod !== undefined) product.processingMethod = input.processingMethod;
};

export const updateProduct = async (
  id: string,
  input: UpdateProductInput,
  updatedBy: string,
): Promise<Product> => {
  log.info('Updating product', { id, updatedBy });

  await AppDataSource.transaction(async (manager) => {
    const product = await manager.getRepository(Product).findOne({ where: { id } });
    if (!product) throw new NotFoundError('Product');

    await applyScalarUpdates(manager, product, input);

    product.updatedBy = updatedBy;
    await manager.getRepository(Product).save(product);

    await applyImageMutations(manager, id, input);
  });

  const full = await productRepo().findOne({
    where: { id },
    relations: ['variants', 'images'],
  });
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
};
