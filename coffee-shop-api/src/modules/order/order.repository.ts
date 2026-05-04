import type { Repository } from 'typeorm';

import { BaseRepository } from '@/shared/repositories/base.repository';
import type { PaginatedResponse } from '@/shared/types/response';

import type { ListOrdersQuery } from './order.dto';
import { Order } from './order.entity';

export class OrderRepository extends BaseRepository<Order> {
  constructor(repository: Repository<Order>) {
    super(repository);
  }

  async findByIdWithRelations(
    id: string,
    relations: string[],
    options?: { withDeleted?: boolean },
  ): Promise<Order | null> {
    return this.findOne({
      where: { id },
      relations,
      withDeleted: options?.withDeleted,
    });
  }

  async findAll(
    query: ListOrdersQuery,
    opts: { requesterId: string; isAdmin: boolean },
  ): Promise<PaginatedResponse<Order[]>> {
    const { page, limit, status, shippingStatus, search } = query;
    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC');

    if (opts.isAdmin) {
      qb.withDeleted();
    }

    if (!opts.isAdmin) {
      qb.andWhere('order.userId = :userId', { userId: opts.requesterId });
    }

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (shippingStatus) {
      qb.andWhere('order.shippingStatus = :shippingStatus', { shippingStatus });
    }

    if (search) {
      qb.andWhere(
        `(
          order.orderNumber ILIKE :search
          OR user.firstName ILIKE :search
          OR user.lastName ILIKE :search
          OR user.email ILIKE :search
          OR user.phoneNumber ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    return this.findPaginated(qb, page, limit);
  }

  async softDelete(id: string): Promise<void> {
    await super.softDelete(id);
  }
}
