import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import {
  CreateProductSchema,
  ListProductsQuerySchema,
  productIdParamSchema,
  ProductParamSchema,
  UpdateProductSchema,
} from './product.dto';
import * as productService from './product.service';
import { toResponse } from './product.mapper';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const input = parseOrThrow(CreateProductSchema.safeParse(req.body));
  const product = await productService.createProduct(input, req.userId!);
  res.status(StatusCodes.CREATED).json({ data: toResponse(product) });
});

export const listProducts = catchAsync(async (req: Request, res: Response) => {
  const query = parseOrThrow(ListProductsQuerySchema.safeParse(req.query));
  const result = await productService.findAllProducts(query);
  res.status(StatusCodes.OK).json({ data: result.data.map(toResponse), meta: result.meta });
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(productIdParamSchema.safeParse(req.params));
  const product = await productService.findProductById(id);
  res.status(StatusCodes.OK).json({ data: toResponse(product) });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(productIdParamSchema.safeParse(req.params));
  const input = parseOrThrow(UpdateProductSchema.safeParse(req.body));
  const product = await productService.updateProduct(id, input, req.userId!);
  res.status(StatusCodes.OK).json({ data: toResponse(product) });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(ProductParamSchema.safeParse(req.params));
  await productService.removeProduct(id, req.userId!);
  res.status(StatusCodes.NO_CONTENT).send();
});
