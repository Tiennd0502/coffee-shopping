import type { Repository } from 'typeorm';

import { BaseRepository } from '@/shared/repositories/base.repository';
import type { PaginatedResponse } from '@/shared/types/response';

import type { ListUsersQuery } from './user.dto';
import { User } from './user.entity';

export class UserRepository extends BaseRepository<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.findOne({ where: { clerkId } });
  }

  async findAll(
    query: ListUsersQuery,
    currentUserId: string,
    options?: { isAdmin?: boolean },
  ): Promise<PaginatedResponse<User[]>> {
    const { page, limit, role, status, search } = query;
    const qb = this.createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .orderBy('user.createdAt', 'DESC');

    if (options?.isAdmin) {
      qb.withDeleted();
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        "(user.firstName || ' ' || user.lastName) ILIKE :search OR user.email ILIKE :search",
        { search: `%${search}%` },
      );
    }

    return this.findPaginated(qb, page, limit);
  }
}
