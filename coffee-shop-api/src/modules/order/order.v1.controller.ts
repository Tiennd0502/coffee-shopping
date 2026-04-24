import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  UpdateShippingStatusSchema,
  orderIdParamSchema,
} from './order.dto';
import * as orderService from './order.service';
import { toResponse } from './order.mapper';

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const input = parseOrThrow(CreateOrderSchema.safeParse(req.body));
  const order = await orderService.createOrder(input, req.userId!);
  res.status(StatusCodes.CREATED).json({ data: toResponse(order) });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(orderIdParamSchema.safeParse(req.params));
  const input = parseOrThrow(UpdateOrderStatusSchema.safeParse(req.body));
  const order = await orderService.updateOrderStatus({ orderId: id, input });
  res.status(StatusCodes.OK).json({ data: toResponse(order) });
});

export const updateOrderShippingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(orderIdParamSchema.safeParse(req.params));
  const input = parseOrThrow(UpdateShippingStatusSchema.safeParse(req.body));
  const order = await orderService.updateOrderShippingStatus({ orderId: id, input });
  res.status(StatusCodes.OK).json({ data: toResponse(order) });
});

export const deleteOrder = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id: orderId } = parseOrThrow(orderIdParamSchema.safeParse(req.params));
  await orderService.deleteOrder({ orderId });
  res.status(StatusCodes.NO_CONTENT).send();
});
