import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import { CreateProductSchema, productIdParamSchema, UpdateProductSchema } from './product.dto';
import * as productService from './product.service';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const input = parseOrThrow(CreateProductSchema.safeParse(req.body));
  const product = await productService.createProduct(input, req.userId!);
  res.status(StatusCodes.CREATED).json({ data: product });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(productIdParamSchema.safeParse(req.params));
  const input = parseOrThrow(UpdateProductSchema.safeParse(req.body));
  const product = await productService.updateProduct(id, input, req.userId!);
  res.status(StatusCodes.OK).json({ data: product });
});
