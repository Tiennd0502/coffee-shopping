import type { Repository } from 'typeorm';

import AppDataSource from '@/config/database';
import { BadRequestError, NotFoundError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import type { PaginatedResponse } from '@/shared/types/response';
import { assertNoDuplicate } from '@/shared/utils/validation';
import { slugFrom } from '@/shared/utils/slug';

import type { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from './category.dto';
import { Category } from './category.entity';

const categoryRepo = (): Repository<Category> => AppDataSource.getRepository(Category);

const assertCategory = async (id: string): Promise<Category> => {
  const category = await categoryRepo().findOne({ where: { id } });
  if (!category) {
    throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND('Category'));
  }
  return category;
};

export const findAllCategories = async (
  query: ListCategoriesQuery,
): Promise<PaginatedResponse<Category[]>> => {
  const { page, limit, search } = query;
  const qb = categoryRepo()
    .createQueryBuilder('category')
    .orderBy('category.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (search) {
    qb.andWhere('category.name ILIKE :search OR category.slug ILIKE :search', {
      search: `%${search}%`,
    });
  }

  const [data, totalCount] = await qb.getManyAndCount();
  return {
    data,
    meta: {
      limit,
      currentPage: page,
      pageCount: Math.ceil(totalCount / limit),
      totalCount,
    },
  };
};

export const findCategoryById = async (id: string): Promise<Category> => assertCategory(id);

export const createCategory = async (
  input: CreateCategoryInput,
  createdBy: string,
): Promise<Category> => {
  const slug = slugFrom(input.name);

  if (!slug) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_REQUEST);
  }

  await Promise.all([
    assertNoDuplicate(categoryRepo(), { name: input.name }, ERROR_MESSAGES.CATEGORY_NAME_EXISTS),
    assertNoDuplicate(categoryRepo(), { slug }, ERROR_MESSAGES.CATEGORY_SLUG_EXISTS),
  ]);

  const entity = categoryRepo().create({
    name: input.name,
    slug,
    createdBy,
    updatedBy: null,
    deletedBy: null,
  });
  return categoryRepo().save(entity);
};

export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput,
  updatedBy: string,
): Promise<Category> => {
  const category = await assertCategory(id);

  if (input.name !== undefined && input.name !== category.name) {
    await assertNoDuplicate(
      categoryRepo(),
      { name: input.name },
      ERROR_MESSAGES.CATEGORY_NAME_EXISTS,
    );
    const newSlug = input.slug ?? slugFrom(input.name);
    await assertNoDuplicate(categoryRepo(), { slug: newSlug }, ERROR_MESSAGES.CATEGORY_SLUG_EXISTS);
    category.name = input.name;
    category.slug = newSlug;
  } else if (input.slug !== undefined && input.slug !== category.slug) {
    await assertNoDuplicate(
      categoryRepo(),
      { slug: input.slug },
      ERROR_MESSAGES.CATEGORY_SLUG_EXISTS,
    );
    category.slug = input.slug;
  }

  category.updatedBy = updatedBy;
  return categoryRepo().save(category);
};

export const removeCategory = async (id: string, deletedBy: string): Promise<void> => {
  const category = await assertCategory(id);
  category.updatedBy = deletedBy;
  category.deletedBy = deletedBy;
  await categoryRepo().save(category);
  await categoryRepo().softDelete({ id });
};
