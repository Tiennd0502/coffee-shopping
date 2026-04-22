import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import { CreateProductSchema } from './product.dto';
import * as productService from './product.service';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const dto = parseOrThrow(CreateProductSchema.safeParse(req.body));
  const product = await productService.createProduct(dto, req.userId!);
  res.status(StatusCodes.CREATED).json(product);
});
