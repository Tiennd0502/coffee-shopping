import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { catchAsync } from '@/shared/utils/async-handler';
import { parseOrThrow } from '@/shared/utils/validation';

import {
  CreateUserSchema,
  ListUsersQuerySchema,
  UpdateUserSchema,
  userRecordIdParamSchema,
} from './user.dto';
import { toMeResponse, toResponse } from './user.mapper';
import * as userService from './user.service';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const [user, addresses] = await Promise.all([
    userService.findUserById(req.userId!),
    userService.findUserAddressesByUserId(req.userId!),
  ]);
  res.status(StatusCodes.OK).json({ data: toMeResponse(user, addresses) });
});

export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const query = parseOrThrow(ListUsersQuerySchema.safeParse(req.query));
  const result = await userService.findAllUsers(query, req.userId!);
  res.status(StatusCodes.OK).json({ data: result.data.map(toResponse), meta: result.meta });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
  const user = await userService.findUserById(id);
  res.status(StatusCodes.OK).json({ data: toResponse(user) });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const body = parseOrThrow(CreateUserSchema.safeParse(req.body));
  const user = await userService.createUser(body);
  res.status(StatusCodes.CREATED).json({ data: toResponse(user) });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
  const body = parseOrThrow(UpdateUserSchema.safeParse(req.body));
  const user = await userService.updateUser(id, body);
  res.status(StatusCodes.OK).json({ data: toResponse(user) });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
  await userService.removeUser(id);
  res.status(StatusCodes.NO_CONTENT).send();
});
