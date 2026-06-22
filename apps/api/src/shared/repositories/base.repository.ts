import type {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import type { PaginatedResponse } from '@/shared/types/response';

export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  create(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete({ id } as unknown as FindOptionsWhere<T>);
  }

  protected async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  protected async find(options: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  protected async findPaginated(
    qb: SelectQueryBuilder<T>,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<T[]>> {
    const [data, totalCount] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        limit,
        currentPage: page,
        pageCount: Math.ceil(totalCount / limit),
        totalCount,
      },
    };
  }

  protected getRepository(): Repository<T> {
    return this.repository;
  }

  protected createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }
}
