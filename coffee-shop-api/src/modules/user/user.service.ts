import type { DataSource } from 'typeorm';

import { clerkClient } from '@/config/clerk';
import { createModuleLogger } from '@/config/logger';
import { USER_ROLE, USER_STATUS } from '@/shared/enums/user';
import { AppError, ConflictError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { BaseService } from '@/shared/services/base.service';
import type { PaginatedResponse } from '@/shared/types/response';

import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './user.dto';
import type { UserAddress } from './user-address.entity';
import type { UserAddressRepository } from './user-address.repository';
import { User } from './user.entity';
import type { UserRepository } from './user.repository';

export type ClerkUserFields = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role?: USER_ROLE;
};

const log = createModuleLogger('UserService');

export interface UserServiceDeps {
  userRepo: UserRepository;
  addressRepo: UserAddressRepository;
  dataSource: DataSource;
}

export class UserService extends BaseService<User, UserRepository> {
  private readonly addressRepo: UserAddressRepository;

  constructor({ userRepo, addressRepo, dataSource }: UserServiceDeps) {
    super(userRepo, dataSource);
    this.addressRepo = addressRepo;
  }

  findAll(query: ListUsersQuery, currentUserId: string): Promise<PaginatedResponse<User[]>> {
    return this.repository.findAll(query, currentUserId);
  }

  findById(id: string): Promise<User> {
    return this.assertById(id, 'User');
  }

  findAddressesByUserId(userId: string): Promise<UserAddress[]> {
    return this.addressRepo.findByUserId(userId);
  }

  async create(input: CreateUserInput): Promise<User> {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
    }

    if (input.clerkId) {
      const byClerk = await this.repository.findByClerkId(input.clerkId);
      if (byClerk) {
        throw new ConflictError(ERROR_MESSAGES.USER_CLERK_ID_TAKEN);
      }
    }

    const entity = this.repository.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber ?? null,
      clerkId: input.clerkId ?? null,
      avatarUrl: input.avatarUrl ?? null,
      status: input.status,
      role: input.role,
    });

    return this.repository.save(entity);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.assertById(id, 'User');
    const previousRole = user.role;

    if (input.email !== undefined && input.email !== user.email) {
      const taken = await this.repository.findByEmail(input.email);
      if (taken) {
        throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
      }
      user.email = input.email;
    }

    if (input.clerkId !== undefined) {
      if (input.clerkId) {
        const byClerk = await this.repository.findByClerkId(input.clerkId);
        if (byClerk && byClerk.id !== user.id) {
          throw new ConflictError(ERROR_MESSAGES.USER_CLERK_ID_TAKEN);
        }
      }
      user.clerkId = input.clerkId;
    }

    if (input.firstName !== undefined) {
      user.firstName = input.firstName;
    }

    if (input.lastName !== undefined) {
      user.lastName = input.lastName;
    }

    if (input.phoneNumber !== undefined) {
      user.phoneNumber = input.phoneNumber ?? null;
    }

    if (input.status !== undefined) {
      user.status = input.status;
    }

    if (input.avatarUrl !== undefined) {
      user.avatarUrl = input.avatarUrl ?? null;
    }

    const roleChanged = input.role !== undefined && input.role !== previousRole;
    user.role = roleChanged ? input.role! : user.role;

    if (roleChanged && user.clerkId) {
      try {
        await clerkClient.users.updateUser(user.clerkId, {
          publicMetadata: { role: input.role },
        });
        log.info('Synced role to Clerk', { userId: user.id, role: input.role });
      } catch (err) {
        log.error('Failed to sync role to Clerk', {
          userId: user.id,
          clerkId: user.clerkId,
          role: input.role,
          err,
        });
        throw err;
      }
    }

    const saved = await this.repository.save(user);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const user = await this.assertById(id, 'User');

    if (user.clerkId) {
      try {
        await clerkClient.users.deleteUser(user.clerkId);
        log.info('User deleted in Clerk', { userId: user.id, clerkId: user.clerkId });
      } catch (err) {
        log.error('Failed to delete user in Clerk', {
          userId: user.id,
          clerkId: user.clerkId,
          err,
        });
        throw err;
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      user.email = `deleted_${user.id}_${user.email}`;
      user.status = USER_STATUS.INACTIVE;
      await userRepo.save(user);
      await userRepo.softDelete(id);
    });
  }

  findByClerkId(clerkId: string): Promise<User | null> {
    return this.repository.findByClerkId(clerkId);
  }

  async syncClerkUserDeleted(clerkId: string): Promise<void> {
    const found = await this.repository.findByClerkId(clerkId);
    if (!found) {
      log.warn('Clerk user.deleted received but user not found, skipping', { clerkId });
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      found.email = `deleted_${found.id}_${found.email}`;
      found.status = USER_STATUS.INACTIVE;
      await userRepo.save(found);
      await userRepo.softDelete(found.id);
    });
  }

  async syncClerkUserUpdated(fields: ClerkUserFields): Promise<void> {
    const found = await this.repository.findByClerkId(fields.clerkId);
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
    found.avatarUrl = fields.avatarUrl ?? null;
    if (fields.role !== undefined) {
      found.role = fields.role;
    }

    await this.repository.save(found);
  }

  async syncClerkUserCreated(fields: ClerkUserFields): Promise<void> {
    try {
      const user = await this.create({
        clerkId: fields.clerkId,
        email: fields.email,
        firstName: fields.firstName,
        lastName: fields.lastName,
        phoneNumber: fields.phone ?? undefined,
        status: USER_STATUS.ACTIVE,
        role: USER_ROLE.USER,
        avatarUrl: fields.avatarUrl ?? undefined,
      });

      try {
        await clerkClient.users.updateUser(fields.clerkId, {
          publicMetadata: { role: user.role },
        });
        log.info('Synced initial role to Clerk', { userId: user.id, role: user.role });
      } catch (err) {
        log.error('Failed to sync initial role to Clerk', { clerkId: fields.clerkId, err });
      }
    } catch (err) {
      if (err instanceof AppError && err.code === ErrorCode.CONFLICT) {
        log.warn('Clerk user already synced, skipping', { clerkId: fields.clerkId });
        return;
      }
      throw err;
    }
  }
}
