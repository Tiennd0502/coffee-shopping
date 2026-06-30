import type { DataSource } from 'typeorm';

import { BadRequestError, ConflictError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { BaseService } from '@/shared/services/base.service';
import type { PaginatedResponse } from '@repo/types';
import { slugFrom } from '@/shared/utils/slug';

import type { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from './category.dto';
import { Category } from './category.entity';
import type { CategoryRepository } from './category.repository';

export interface CategoryServiceDeps {
  categoryRepo: CategoryRepository;
  dataSource: DataSource;
}

export class CategoryService extends BaseService<Category, CategoryRepository> {
  constructor({ categoryRepo, dataSource }: CategoryServiceDeps) {
    super(categoryRepo, dataSource);
  }

  findAll(
    query: ListCategoriesQuery,
    options?: { isAdmin?: boolean },
  ): Promise<PaginatedResponse<Category[]>> {
    return this.repository.findAll(query, options);
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

    await this.dataSource.transaction(async (manager) => {
      const categoryRepo = manager.getRepository(Category);
      category.updatedBy = deletedBy;
      category.deletedBy = deletedBy;
      await categoryRepo.save(category);
      await categoryRepo.softDelete(category.id);
    });
  }
}
