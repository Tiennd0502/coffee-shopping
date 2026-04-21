import type { Repository } from 'typeorm';

import AppDataSource from '@/config/database';
import { BadRequestError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { assertNoDuplicate } from '@/shared/utils/validation';
import { slugFrom } from '@/shared/utils/slug';

import type { CreateCategoryInput } from './category.dto';
import { Category } from './category.entity';

const categoryRepo = (): Repository<Category> => AppDataSource.getRepository(Category);

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
