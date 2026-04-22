import type { Repository } from 'typeorm';

import AppDataSource from '@/config/database';
import { createModuleLogger } from '@/config/logger';
import { Category } from '@/modules/category/category.entity';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { withRandomSkuSuffix } from '@/shared/utils/sku';
import { slugFrom } from '@/shared/utils/slug';
import { assertNoDuplicate } from '@/shared/utils/validation';

import type { CreateProductDto, ProductResponse } from './product.dto';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { toResponse } from './product.mapper';

const log = createModuleLogger('ProductService');

const productRepo = (): Repository<Product> => AppDataSource.getRepository(Product);
const imageRepo = (): Repository<ProductImage> => AppDataSource.getRepository(ProductImage);
const variantRepo = (): Repository<ProductVariant> => AppDataSource.getRepository(ProductVariant);
const categoryRepo = (): Repository<Category> => AppDataSource.getRepository(Category);
const variantNameFrom = (weight: number, unit: string): string => `${String(weight)}${unit}`;
const MAX_SKU_GENERATION_ATTEMPTS = 5;

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
  dto: CreateProductDto,
  createdBy: string,
): Promise<ProductResponse> => {
  log.info('Creating product', { name: dto.name, createdBy });

  const category = await categoryRepo().findOne({ where: { id: dto.categoryId } });
  if (!category) throw new NotFoundError('Category');

  const skus = dto.variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) {
    throw new BadRequestError(ERROR_MESSAGES.PRODUCT.DUPLICATE_SKU_IN_REQUEST);
  }

  const slug = slugFrom(dto.name);
  await assertNoDuplicate(productRepo(), { slug }, ERROR_MESSAGES.PRODUCT.SLUG_EXISTS);

  const pendingSkus = new Set<string>();
  const variantsWithGeneratedSku: CreateProductDto['variants'] = [];
  for (const variant of dto.variants) {
    variantsWithGeneratedSku.push({
      ...variant,
      sku: await generateUniqueVariantSku(variant.sku, pendingSkus),
    });
  }

  const product = productRepo().create({
    categoryId: dto.categoryId,
    name: dto.name,
    slug,
    description: dto.description ?? null,
    roastLevel: dto.roastLevel,
    isOrganic: dto.isOrganic,
    isFairTrade: dto.isFairTrade,
    status: dto.status,
    tastingNotes: dto.tastingNotes ?? null,
    origin: dto.origin ?? null,
    processingMethod: dto.processingMethod ?? null,
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
    images: dto.images.map((image) => imageRepo().create(image)),
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

  return toResponse(full);
};
