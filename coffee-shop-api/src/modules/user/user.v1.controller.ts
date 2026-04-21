import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BadRequestError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { catchAsync } from '@/shared/utils/async-handler';

import { CreateUserSchema, UpdateUserSchema, userRecordIdParamSchema } from './user.dto';
import { toResponse } from './user.mapper';
import * as userService from './user.service';

const parseOrThrow = <T>(
  result: { success: true; data: T } | { success: false; error: unknown },
): T => {
  if (!result.success) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_REQUEST);
  }
  return result.data;
};

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findUserById(req.userId!);
  res.status(StatusCodes.OK).json(toResponse(user));
});

export const listUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await userService.findAllUsers();
  res.status(StatusCodes.OK).json(users.map(toResponse));
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
  const user = await userService.findUserById(id);
  res.status(StatusCodes.OK).json(toResponse(user));
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const body = parseOrThrow(CreateUserSchema.safeParse(req.body));
  const user = await userService.createUser(body);
  res.status(StatusCodes.CREATED).json(toResponse(user));
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
  const body = parseOrThrow(UpdateUserSchema.safeParse(req.body));
  const user = await userService.updateUser(id, body);
  res.status(StatusCodes.OK).json(toResponse(user));
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
  await userService.removeUser(id);
  res.status(StatusCodes.NO_CONTENT).send();
});
