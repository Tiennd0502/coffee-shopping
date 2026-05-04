import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { parseOrThrow } from '@/shared/utils/validation';

import {
  CreateUserSchema,
  ListUsersQuerySchema,
  UpdateUserSchema,
  userRecordIdParamSchema,
} from './user.dto';
import { UserMapper } from './user.mapper';
import type { UserService } from './user.service';

export class UserController {
  constructor(private readonly service: UserService) {}

  getMe = async (req: Request, res: Response): Promise<void> => {
    const [user, addresses] = await Promise.all([
      this.service.findById(req.userId!),
      this.service.findAddressesByUserId(req.userId!),
    ]);

    res.status(StatusCodes.OK).json({ data: UserMapper.toMeResponse(user, addresses) });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const query = parseOrThrow(ListUsersQuerySchema.safeParse(req.query));
    const result = await this.service.findAll(query, req.userId!);

    res.status(StatusCodes.OK).json({
      data: result.data.map(UserMapper.toResponse),
      meta: result.meta,
    });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
    const user = await this.service.findById(id);

    res.status(StatusCodes.OK).json({ data: UserMapper.toResponse(user) });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const body = parseOrThrow(CreateUserSchema.safeParse(req.body));
    const user = await this.service.create(body);

    res.status(StatusCodes.CREATED).json({ data: UserMapper.toResponse(user) });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
    const body = parseOrThrow(UpdateUserSchema.safeParse(req.body));
    const user = await this.service.update(id, body);

    res.status(StatusCodes.OK).json({ data: UserMapper.toResponse(user) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = parseOrThrow(userRecordIdParamSchema.safeParse(req.params));
    await this.service.remove(id);

    res.status(StatusCodes.NO_CONTENT).send();
  };
}
