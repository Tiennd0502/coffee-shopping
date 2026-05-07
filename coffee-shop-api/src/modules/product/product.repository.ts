import { In, type Repository, type SelectQueryBuilder } from 'typeorm';

import { PRODUCT_SORT, PRODUCT_STATUS } from '@/shared/enums/product';
import { BaseRepository } from '@/shared/repositories/base.repository';
import type { PaginatedResponse } from '@/shared/types/response';

import type { ListProductsQuery } from './product.dto';
import { Product } from './product.entity';

const PRICE_SUBQUERY =
  '(SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = product.id AND v.deleted_at IS NULL)';

export class ProductRepository extends BaseRepository<Product> {
  constructor(repository: Repository<Product>) {
    super(repository);
  }

  async findByIdWithRelations(id: string): Promise<Product | null> {
    return this.findOne({
      where: { id },
      relations: ['variants', 'images'],
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.findOne({ where: { slug } });
  }

  async findAll(
    query: ListProductsQuery,
    options?: { isAdmin?: boolean },
  ): Promise<PaginatedResponse<Product[]>> {
    const { page, limit, search, status, categoryId, roastLevel, minPrice, maxPrice, sortBy } =
      query;
    const qb = this.createQueryBuilder('product');
    const isAdmin = options?.isAdmin ?? false;

    if (isAdmin) {
      qb.withDeleted();
    }

    if (status) {
      qb.andWhere('product.status = :status', { status });
    } else if (!isAdmin) {
      qb.andWhere('product.status = :status', { status: PRODUCT_STATUS.ACTIVE });
    }
    if (categoryId) qb.andWhere('product.categoryId = :categoryId', { categoryId });
    if (roastLevel?.length) {
      qb.andWhere('product.roastLevel IN (:...roastLevels)', { roastLevels: roastLevel });
    }
    if (search) {
      qb.andWhere('product.name ILIKE :search OR product.slug ILIKE :search', {
        search: `%${search}%`,
      });
    }
    if (minPrice !== undefined) {
      qb.andWhere(`${PRICE_SUBQUERY} >= :minPrice`, { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere(`${PRICE_SUBQUERY} <= :maxPrice`, { maxPrice });
    }

    this.applySortOrder(qb, sortBy);

    const paginated = await this.findPaginated(qb, page, limit);
    if (!paginated.data.length) {
      return paginated;
    }

    const data = await this.findByIds(
      paginated.data.map((product) => product.id),
      { withDeleted: isAdmin },
    );

    return {
      data,
      meta: paginated.meta,
    };
  }

  async findByIds(ids: string[], options?: { withDeleted?: boolean }): Promise<Product[]> {
    if (!ids.length) {
      return [];
    }

    const items = await this.find({
      where: { id: In(ids) },
      relations: ['variants', 'images'],
      withDeleted: options?.withDeleted,
    });

    const order = new Map(ids.map((id, index) => [id, index]));
    items.sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
    return items;
  }

  private applySortOrder(qb: SelectQueryBuilder<Product>, sortBy: PRODUCT_SORT | undefined): void {
    switch (sortBy) {
      case PRODUCT_SORT.PRICE_ASC:
        qb.orderBy(PRICE_SUBQUERY, 'ASC');
        break;
      case PRODUCT_SORT.PRICE_DESC:
        qb.orderBy(PRICE_SUBQUERY, 'DESC');
        break;
      case PRODUCT_SORT.NAME_ASC:
        qb.orderBy('product.name', 'ASC');
        break;
      case PRODUCT_SORT.NAME_DESC:
        qb.orderBy('product.name', 'DESC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }
  }
}
