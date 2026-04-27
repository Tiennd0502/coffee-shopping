import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import { categoryIdParamSchema, CategorySchema, ListCategoriesQuerySchema } from './category.dto';
import { toResponse } from './category.mapper';
import * as categoryService from './category.service';

export const listCategories = catchAsync(async (req: Request, res: Response) => {
  const query = parseOrThrow(ListCategoriesQuerySchema.safeParse(req.query));
  const result = await categoryService.findAllCategories(query);
  res.status(StatusCodes.OK).json({ data: result.data.map(toResponse), meta: result.meta });
});

export const getCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
  const category = await categoryService.findCategoryById(id);
  res.status(StatusCodes.OK).json({ data: toResponse(category) });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const body = parseOrThrow(CategorySchema.safeParse(req.body));
  const category = await categoryService.createCategory(body, req.userId!);
  res.status(StatusCodes.CREATED).json({ data: toResponse(category) });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
  const body = parseOrThrow(CategorySchema.safeParse(req.body));
  const category = await categoryService.updateCategory(id, body, req.userId!);
  res.status(StatusCodes.OK).json({ data: toResponse(category) });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
  await categoryService.removeCategory(id, req.userId!);
  res.status(StatusCodes.NO_CONTENT).send();
});
