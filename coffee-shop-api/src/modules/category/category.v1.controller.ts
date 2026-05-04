import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { parseOrThrow } from '@/shared/utils/validation';

import { categoryIdParamSchema, CategorySchema, ListCategoriesQuerySchema } from './category.dto';
import { CategoryMapper } from './category.mapper';
import type { CategoryService } from './category.service';

export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = parseOrThrow(ListCategoriesQuerySchema.safeParse(req.query));
    const result = await this.service.findAll(query);

    res.status(StatusCodes.OK).json({
      data: result.data.map(CategoryMapper.toResponse),
      meta: result.meta,
    });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
    const category = await this.service.findById(id);

    res.status(StatusCodes.OK).json({ data: CategoryMapper.toResponse(category) });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const body = parseOrThrow(CategorySchema.safeParse(req.body));
    const category = await this.service.create(body, req.userId!);

    res.status(StatusCodes.CREATED).json({ data: CategoryMapper.toResponse(category) });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
    const body = parseOrThrow(CategorySchema.safeParse(req.body));
    const category = await this.service.update(id, body, req.userId!);

    res.status(StatusCodes.OK).json({ data: CategoryMapper.toResponse(category) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(categoryIdParamSchema.safeParse(req.params));
    await this.service.remove(id, req.userId!);

    res.status(StatusCodes.NO_CONTENT).send();
  };
}
