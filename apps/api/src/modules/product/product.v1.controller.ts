import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLE } from '@/shared/enums/user';

import { parseOrThrow } from '@/shared/utils/validation';

import {
  CreateProductSchema,
  ListProductsQuerySchema,
  productIdParamSchema,
  ProductParamSchema,
  UpdateProductSchema,
} from './product.dto';
import { ProductMapper } from './product.mapper';
import type { ProductService } from './product.service';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = parseOrThrow(ListProductsQuerySchema.safeParse(req.query));
    const isAdmin = req.userRole === USER_ROLE.ADMIN;
    const result = await this.service.findAll(query, { isAdmin });

    res.status(StatusCodes.OK).json({
      data: result.data.map(ProductMapper.toResponse),
      meta: result.meta,
    });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(productIdParamSchema.safeParse(req.params));
    const product = await this.service.findById(id);

    res.status(StatusCodes.OK).json({ data: ProductMapper.toResponse(product) });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input = parseOrThrow(CreateProductSchema.safeParse(req.body));
    const product = await this.service.create(input, req.userId!);

    res.status(StatusCodes.CREATED).json({ data: ProductMapper.toResponse(product) });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(productIdParamSchema.safeParse(req.params));
    const input = parseOrThrow(UpdateProductSchema.safeParse(req.body));
    const product = await this.service.update(id, input, req.userId!);

    res.status(StatusCodes.OK).json({ data: ProductMapper.toResponse(product) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(ProductParamSchema.safeParse(req.params));
    await this.service.remove(id, req.userId!);

    res.status(StatusCodes.NO_CONTENT).send();
  };
}
