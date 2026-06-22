import type { Repository } from 'typeorm';

import { BaseRepository } from '@/shared/repositories/base.repository';
import type { PaginatedResponse } from '@/shared/types/response';

import type { ListCategoriesQuery } from './category.dto';
import { Category } from './category.entity';

export class CategoryRepository extends BaseRepository<Category> {
  constructor(repository: Repository<Category>) {
    super(repository);
  }

  async findByName(name: string): Promise<Category | null> {
    return this.findOne({ where: { name } });
  }

  async findAll(
    query: ListCategoriesQuery,
    options?: { isAdmin?: boolean },
  ): Promise<PaginatedResponse<Category[]>> {
    const { page, limit, search } = query;
    const qb = this.createQueryBuilder('category').orderBy('category.createdAt', 'DESC');
    const isAdmin = options?.isAdmin ?? false;

    if (isAdmin) {
      qb.withDeleted();
    }

    if (search) {
      qb.andWhere('category.name ILIKE :search OR category.slug ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return this.findPaginated(qb, page, limit);
  }
}
