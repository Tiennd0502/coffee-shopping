import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { USER_ROLE } from '@repo/types';
import { parseOrThrow } from '@/shared/utils/validation';

import {
  CreateOrderSchema,
  ListOrdersQuerySchema,
  UpdateOrderStatusSchema,
  UpdateShippingStatusSchema,
  orderIdParamSchema,
} from './order.dto';
import { OrderMapper } from './order.mapper';
import type { OrderService } from './order.service';

export class OrderController {
  constructor(private readonly service: OrderService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const input = parseOrThrow(CreateOrderSchema.safeParse(req.body));
    const order = await this.service.create(input, req.userId!);
    res.status(StatusCodes.CREATED).json({ data: OrderMapper.toResponse(order) });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const query = parseOrThrow(ListOrdersQuerySchema.safeParse(req.query));
    const isAdmin = req.userRole === USER_ROLE.ADMIN;
    const result = await this.service.findAll({ query, requesterId: req.userId!, isAdmin });

    res.status(StatusCodes.OK).json({
      data: result.data.map(OrderMapper.toResponse),
      meta: result.meta,
    });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { id: orderId } = parseOrThrow(orderIdParamSchema.safeParse(req.params));
    const isAdmin = req.userRole === USER_ROLE.ADMIN;
    const order = await this.service.findById({ orderId, requesterId: req.userId!, isAdmin });
    res.status(StatusCodes.OK).json({ data: OrderMapper.toResponse(order) });
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(orderIdParamSchema.safeParse(req.params));
    const input = parseOrThrow(UpdateOrderStatusSchema.safeParse(req.body));
    const order = await this.service.updateStatus(id, input);
    res.status(StatusCodes.OK).json({ data: OrderMapper.toResponse(order) });
  };

  updateShippingStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(orderIdParamSchema.safeParse(req.params));
    const input = parseOrThrow(UpdateShippingStatusSchema.safeParse(req.body));
    const order = await this.service.updateShippingStatus(id, input);
    res.status(StatusCodes.OK).json({ data: OrderMapper.toResponse(order) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id: orderId } = parseOrThrow(orderIdParamSchema.safeParse(req.params));
    await this.service.remove(orderId);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
