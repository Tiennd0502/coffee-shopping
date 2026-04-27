import { z } from 'zod';

import { VALIDATION_RULES } from '@/shared/constants/validation';
import { DISCOUNT_TYPE, PRODUCT_SORT, PRODUCT_STATUS, ROAST_LEVEL } from '@/shared/enums/product';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

export const CreateProductVariantSchema = z.object({
  sku: z
    .string()
    .min(VALIDATION_RULES.PRODUCT.VARIANT.SKU.MIN_LENGTH)
    .max(VALIDATION_RULES.PRODUCT.VARIANT.SKU.MAX_LENGTH)
    .trim(),
  weight: z.number().positive(),
  unit: z
    .string()
    .min(VALIDATION_RULES.PRODUCT.VARIANT.UNIT.MIN_LENGTH)
    .max(VALIDATION_RULES.PRODUCT.VARIANT.UNIT.MAX_LENGTH)
    .trim(),
  price: z.number().positive(),
  discountType: z.nativeEnum(DISCOUNT_TYPE).nullable().default(null),
  discountValue: z.number().positive().nullable().default(null),
  quantity: z.number().int().min(0).default(0),
});

export type CreateProductVariantInput = z.infer<typeof CreateProductVariantSchema>;

export const CreateProductImageSchema = z.object({
  url: z.string().url().max(VALIDATION_RULES.PRODUCT.IMAGE.URL_MAX_LENGTH).trim(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export type CreateProductImageInput = z.infer<typeof CreateProductImageSchema>;

export const UpdateProductImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url().max(VALIDATION_RULES.PRODUCT.IMAGE.URL_MAX_LENGTH).trim().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateProductImageInput = z.infer<typeof UpdateProductImageSchema>;

export const CreateProductSchema = z
  .object({
    categoryId: z.string().uuid(),
    name: z
      .string()
      .min(VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH)
      .max(VALIDATION_RULES.PRODUCT.NAME.MAX_LENGTH)
      .trim(),
    description: z.string().max(VALIDATION_RULES.PRODUCT.DESCRIPTION.MAX_LENGTH).trim().optional(),
    roastLevel: z.nativeEnum(ROAST_LEVEL),
    isOrganic: z.boolean().default(false),
    isFairTrade: z.boolean().default(false),
    status: z.nativeEnum(PRODUCT_STATUS).default(PRODUCT_STATUS.DRAFT),
    tastingNotes: z
      .string()
      .max(VALIDATION_RULES.PRODUCT.TASTING_NOTES.MAX_LENGTH)
      .trim()
      .optional(),
    origin: z.string().max(VALIDATION_RULES.PRODUCT.ORIGIN.MAX_LENGTH).trim().optional(),
    processingMethod: z
      .string()
      .max(VALIDATION_RULES.PRODUCT.PROCESSING_METHOD.MAX_LENGTH)
      .trim()
      .optional(),
    variants: z.array(CreateProductVariantSchema).min(1),
    images: z
      .array(CreateProductImageSchema)
      .max(VALIDATION_RULES.PRODUCT.IMAGE.MAX_COUNT)
      .default([]),
  })
  .superRefine((data, ctx) => {
    const primaryCount = data.images.filter((image) => image.isPrimary).length;
    if (primaryCount > VALIDATION_RULES.PRODUCT.IMAGE.MAX_AVATARS_ALLOWED) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.PRODUCT.MULTIPLE_PRIMARY_IMAGES,
        path: ['images'],
      });
    }
  });

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const productIdParamSchema = z.object({ id: z.string().uuid() });

export const ListProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(VALIDATION_RULES.PAGINATION.DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(VALIDATION_RULES.PAGINATION.MAX_LIMIT)
      .default(VALIDATION_RULES.PAGINATION.DEFAULT_LIMIT),
    status: z.nativeEnum(PRODUCT_STATUS).optional(),
    categoryId: z.string().uuid().optional(),
    search: z.string().trim().optional(),
    roastLevel: z
      .string()
      .transform((v) => v.split(',') as ROAST_LEVEL[])
      .pipe(z.array(z.nativeEnum(ROAST_LEVEL)).min(1))
      .optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    sortBy: z.nativeEnum(PRODUCT_SORT).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.minPrice !== undefined &&
      data.maxPrice !== undefined &&
      data.minPrice > data.maxPrice
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minPrice must be less than or equal to maxPrice',
        path: ['minPrice'],
      });
    }
  });

export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;

export const UpdateProductSchema = z
  .object({
    categoryId: z.string().uuid(),
    name: z
      .string()
      .min(VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH)
      .max(VALIDATION_RULES.PRODUCT.NAME.MAX_LENGTH)
      .trim(),
    description: z.string().max(VALIDATION_RULES.PRODUCT.DESCRIPTION.MAX_LENGTH).trim().nullable(),
    roastLevel: z.nativeEnum(ROAST_LEVEL),
    isOrganic: z.boolean(),
    isFairTrade: z.boolean(),
    status: z.nativeEnum(PRODUCT_STATUS),
    tastingNotes: z
      .string()
      .max(VALIDATION_RULES.PRODUCT.TASTING_NOTES.MAX_LENGTH)
      .trim()
      .nullable(),
    origin: z.string().max(VALIDATION_RULES.PRODUCT.ORIGIN.MAX_LENGTH).trim().nullable(),
    processingMethod: z
      .string()
      .max(VALIDATION_RULES.PRODUCT.PROCESSING_METHOD.MAX_LENGTH)
      .trim()
      .nullable(),
    removeImageIds: z.array(z.string().uuid()),
    updateImages: z.array(UpdateProductImageSchema),
    addImages: z.array(CreateProductImageSchema).max(VALIDATION_RULES.PRODUCT.IMAGE.MAX_COUNT),
  })
  .partial()
  .superRefine((data, ctx) => {
    const removeIds = data.removeImageIds ?? [];
    if (new Set(removeIds).size !== removeIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.PRODUCT.DUPLICATE_IMAGE_IDS,
        path: ['removeImageIds'],
      });
    }

    const updateIds = (data.updateImages ?? []).map((img) => img.id);
    if (new Set(updateIds).size !== updateIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.PRODUCT.DUPLICATE_IMAGE_IDS,
        path: ['updateImages'],
      });
    }

    const overlap = updateIds.filter((id) => removeIds.includes(id));
    if (overlap.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.PRODUCT.OVERLAPPING_IMAGE_MUTATIONS,
        path: ['updateImages'],
      });
    }

    const explicitPrimaries = [
      ...(data.addImages ?? []).filter((img) => img.isPrimary === true),
      ...(data.updateImages ?? []).filter((img) => img.isPrimary === true),
    ];
    if (explicitPrimaries.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ERROR_MESSAGES.PRODUCT.MULTIPLE_PRIMARY_IMAGES,
        path: ['addImages'],
      });
    }
  });

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const ProductParamSchema = z.object({
  id: z.string().uuid(),
});

export type ProductParam = z.infer<typeof ProductParamSchema>;

export const ProductImageResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  url: z.string(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductImageResponse = z.infer<typeof ProductImageResponseSchema>;

export const ProductVariantResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string(),
  weight: z.number(),
  unit: z.string(),
  name: z.string(),
  price: z.number(),
  discountType: z.nativeEnum(DISCOUNT_TYPE).nullable(),
  discountValue: z.number().nullable(),
  quantity: z.number(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductVariantResponse = z.infer<typeof ProductVariantResponseSchema>;

export const ProductResponseSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  roastLevel: z.nativeEnum(ROAST_LEVEL),
  isOrganic: z.boolean(),
  isFairTrade: z.boolean(),
  status: z.nativeEnum(PRODUCT_STATUS),
  tastingNotes: z.string().nullable(),
  origin: z.string().nullable(),
  processingMethod: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  variants: z.array(ProductVariantResponseSchema),
  images: z.array(ProductImageResponseSchema),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
