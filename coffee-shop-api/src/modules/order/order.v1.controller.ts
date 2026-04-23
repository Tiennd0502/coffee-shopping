import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import { CreateOrderSchema } from './order.dto';
import * as orderService from './order.service';
import { toResponse } from './order.mapper';

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const input = parseOrThrow(CreateOrderSchema.safeParse(req.body));
  const order = await orderService.createOrder(input, req.userId!);
  res.status(StatusCodes.CREATED).json({ data: toResponse(order) });
});
