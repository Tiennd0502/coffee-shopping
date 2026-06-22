import { In, type FindOptionsWhere, type Repository } from 'typeorm';

import { BaseRepository } from '@/shared/repositories/base.repository';

import { ProductVariant } from './product-variant.entity';

export class ProductVariantRepository extends BaseRepository<ProductVariant> {
  constructor(repository: Repository<ProductVariant>) {
    super(repository);
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    return this.findOne({ where: { sku } });
  }

  async findByIds(ids: string[], relations?: string[]): Promise<ProductVariant[]> {
    if (!ids.length) {
      return [];
    }

    return this.find({
      where: { id: In(ids) } as unknown as FindOptionsWhere<ProductVariant>,
      relations,
    });
  }
}
