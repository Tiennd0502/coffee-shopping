import { CategoryResponseSchema, type CategoryResponse } from './category.dto';
import { Category } from './category.entity';

export const toResponse = (category: Category): CategoryResponse =>
  CategoryResponseSchema.parse({
    id: category.id,
    name: category.name,
    slug: category.slug,
    createdBy: category.createdBy,
    updatedBy: category.updatedBy,
    deletedBy: category.deletedBy,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    deletedAt: category.deletedAt?.toISOString() ?? null,
  });
