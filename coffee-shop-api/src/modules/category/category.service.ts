import { BadRequestError, ConflictError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { BaseService } from '@/shared/services/base.service';
import type { PaginatedResponse } from '@/shared/types/response';
import { slugFrom } from '@/shared/utils/slug';

import type { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from './category.dto';
import { Category } from './category.entity';
import type { CategoryRepository } from './category.repository';

export class CategoryService extends BaseService<Category, CategoryRepository> {
  constructor(categoryRepo: CategoryRepository) {
    super(categoryRepo);
  }

  findAll(query: ListCategoriesQuery): Promise<PaginatedResponse<Category[]>> {
    return this.repository.findAll(query);
  }

  findById(id: string): Promise<Category> {
    return this.assertById(id, 'Category');
  }

  async create(input: CreateCategoryInput, createdBy: string): Promise<Category> {
    const slug = slugFrom(input.name);
    if (!slug) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_REQUEST);
    }

    const existingByName = await this.repository.findByName(input.name);
    if (existingByName) {
      throw new ConflictError(ERROR_MESSAGES.CATEGORY_NAME_EXISTS);
    }

    const entity = this.repository.create({
      name: input.name,
      slug,
      createdBy,
      updatedBy: null,
      deletedBy: null,
    });

    return this.repository.save(entity);
  }

  async update(id: string, input: UpdateCategoryInput, updatedBy: string): Promise<Category> {
    const category = await this.assertById(id, 'Category');

    if (input.name !== undefined && input.name !== category.name) {
      const existingByName = await this.repository.findByName(input.name);
      if (existingByName) {
        throw new ConflictError(ERROR_MESSAGES.CATEGORY_NAME_EXISTS);
      }

      category.name = input.name;
      category.slug = slugFrom(input.name);
    }

    category.updatedBy = updatedBy;
    return this.repository.save(category);
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    const category = await this.assertById(id, 'Category');
    category.updatedBy = deletedBy;
    category.deletedBy = deletedBy;
    await this.repository.save(category);
    await this.repository.softDelete(id);
  }
}
