import { CategoryResponseSchema, type CategoryResponse } from './category.dto';
import type { Category } from './category.entity';

export class CategoryMapper {
  static toResponse(category: Category): CategoryResponse {
    return CategoryResponseSchema.parse({
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
  }
}
