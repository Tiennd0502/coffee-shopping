import type { Repository } from 'typeorm';

import AppDataSource from '@/config/database';
import { createModuleLogger } from '@/config/logger';
import { USER_ROLE, USER_STATUS } from '@/shared/enums/user';
import { AppError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import type { PaginatedResponse } from '@/shared/types/response';

import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './user.dto';
import { User } from './user.entity';

export type ClerkUserFields = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

const log = createModuleLogger('UserService');

const userRepo = (): Repository<User> => AppDataSource.getRepository(User);

const assertUser = async (id: string): Promise<User> => {
  const found = await userRepo().findOne({ where: { id } });
  if (!found) {
    throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND('User'));
  }
  return found;
};

export const findAllUsers = async (query: ListUsersQuery): Promise<PaginatedResponse<User[]>> => {
  const { page, limit, role, status, search } = query;
  const qb = userRepo()
    .createQueryBuilder('user')
    .orderBy('user.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (role) qb.andWhere('user.role = :role', { role });
  if (status) qb.andWhere('user.status = :status', { status });
  if (search) {
    qb.andWhere(
      "(user.firstName || ' ' || user.lastName) ILIKE :search OR user.email ILIKE :search",
      { search: `%${search}%` },
    );
  }
  const [data, totalCount] = await qb.getManyAndCount();
  return {
    data,
    meta: {
      limit,
      currentPage: page,
      pageCount: Math.ceil(totalCount / limit),
      totalCount,
    },
  };
};

export const findUserById = async (id: string): Promise<User> => assertUser(id);

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const existing = await userRepo().findOne({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
  }

  if (input.clerkId) {
    const byClerk = await userRepo().findOne({ where: { clerkId: input.clerkId } });
    if (byClerk) {
      throw new ConflictError(ERROR_MESSAGES.USER_CLERK_ID_TAKEN);
    }
  }
  const entity = userRepo().create({
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phoneNumber: input.phoneNumber ?? null,
    clerkId: input.clerkId ?? null,
    status: input.status,
    role: input.role,
  });
  return userRepo().save(entity);
};

export const updateUser = async (id: string, input: UpdateUserInput): Promise<User> => {
  const user = await assertUser(id);
  if (input.email !== undefined && input.email !== user.email) {
    const taken = await userRepo().findOne({ where: { email: input.email } });
    if (taken) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
    }
    user.email = input.email;
  }
  if (input.firstName !== undefined) user.firstName = input.firstName;
  if (input.lastName !== undefined) user.lastName = input.lastName;
  if (input.phoneNumber !== undefined) user.phoneNumber = input.phoneNumber ?? null;
  if (input.clerkId !== undefined) {
    if (input.clerkId) {
      const byClerk = await userRepo().findOne({ where: { clerkId: input.clerkId } });
      if (byClerk && byClerk.id !== user.id) {
        throw new ConflictError(ERROR_MESSAGES.USER_CLERK_ID_TAKEN);
      }
    }
    user.clerkId = input.clerkId;
  }
  if (input.status !== undefined) user.status = input.status;
  if (input.role !== undefined) user.role = input.role;
  return userRepo().save(user);
};

export const removeUser = async (id: string): Promise<void> => {
  const user = await assertUser(id);
  user.email = `deleted_${user.id}_${user.email}`;
  await userRepo().save(user);
  await userRepo().softDelete({ id });
};

export const findUserByClerkId = async (clerkId: string): Promise<User | null> =>
  userRepo().findOne({ where: { clerkId } });

export const syncClerkUserDeleted = async (clerkId: string): Promise<void> => {
  const found = await userRepo().findOne({ where: { clerkId } });
  if (!found) {
    log.warn('Clerk user.deleted received but user not found, skipping', { clerkId });
    return;
  }
  found.email = `deleted_${found.id}_${found.email}`;
  found.status = USER_STATUS.INACTIVE;
  await userRepo().save(found);
  await userRepo().softDelete({ id: found.id });
};

export const syncClerkUserUpdated = async (fields: ClerkUserFields): Promise<void> => {
  const found = await userRepo().findOne({ where: { clerkId: fields.clerkId } });
  if (!found) {
    log.warn('Clerk user.updated received but user not found, skipping', {
      clerkId: fields.clerkId,
    });
    return;
  }
  found.email = fields.email;
  found.firstName = fields.firstName;
  found.lastName = fields.lastName;
  found.phoneNumber = fields.phone ?? null;
  await userRepo().save(found);
};

export const syncClerkUserCreated = async (fields: ClerkUserFields): Promise<void> => {
  try {
    await createUser({
      clerkId: fields.clerkId,
      email: fields.email,
      firstName: fields.firstName,
      lastName: fields.lastName,
      phoneNumber: fields.phone ?? undefined,
      status: USER_STATUS.ACTIVE,
      role: USER_ROLE.USER,
    });
  } catch (err) {
    if (err instanceof AppError && err.code === ErrorCode.CONFLICT) {
      log.warn('Clerk user already synced, skipping', { clerkId: fields.clerkId });
      return;
    }
    throw err;
  }
};
