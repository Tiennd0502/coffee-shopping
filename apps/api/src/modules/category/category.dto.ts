import { z } from 'zod';

import { VALIDATION_RULES } from '@/shared/constants/validation';

const nameSchema = z
  .string()
  .min(VALIDATION_RULES.CATEGORY_NAME.MIN_LENGTH)
  .max(VALIDATION_RULES.CATEGORY_NAME.MAX_LENGTH)
  .trim();

export const CategorySchema = z
  .object({
    name: nameSchema,
  })
  .openapi('CreateCategoryInput');

export type CreateCategoryInput = z.infer<typeof CategorySchema>;

export type UpdateCategoryInput = z.infer<typeof CategorySchema>;

export const ListCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(VALIDATION_RULES.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(VALIDATION_RULES.PAGINATION.MAX_LIMIT)
    .default(VALIDATION_RULES.PAGINATION.DEFAULT_LIMIT),
  search: z.string().trim().optional(),
});

export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;

export const categoryIdParamSchema = z.object({ id: z.string().uuid() });

export const CategoryResponseSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    createdBy: z.string().uuid().nullable(),
    updatedBy: z.string().uuid().nullable(),
    deletedBy: z.string().uuid().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
  })
  .openapi('CategoryResponse');

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
