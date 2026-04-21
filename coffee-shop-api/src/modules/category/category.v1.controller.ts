import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import { CreateCategorySchema } from './category.dto';
import { toResponse } from './category.mapper';
import * as categoryService from './category.service';

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const body = parseOrThrow(CreateCategorySchema.safeParse(req.body));
  const category = await categoryService.createCategory(body, req.userId!);
  res.status(StatusCodes.CREATED).json(toResponse(category));
});
