import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import { categoryIdParamSchema, CategorySchema } from './category.dto';
import { toResponse } from './category.mapper';
import * as categoryService from './category.service';

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const body = parseOrThrow(CategorySchema.safeParse(req.body));
  const category = await categoryService.createCategory(body, req.userId!);
  res.status(StatusCodes.CREATED).json(toResponse(category));
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
  const body = parseOrThrow(CategorySchema.safeParse(req.body));
  const category = await categoryService.updateCategory(id, body, req.userId!);
  res.status(StatusCodes.OK).json(toResponse(category));
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
  await categoryService.removeCategory(id, req.userId!);
  res.status(StatusCodes.NO_CONTENT).send();
});
