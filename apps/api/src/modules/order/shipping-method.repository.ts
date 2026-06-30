import type { Repository } from 'typeorm';

import { BaseRepository } from '@/shared/repositories/base.repository';
import { SHIPPING_METHOD_STATUS } from '@repo/types';

import { ShippingMethod } from './shipping-method.entity';

export class ShippingMethodRepository extends BaseRepository<ShippingMethod> {
  constructor(repository: Repository<ShippingMethod>) {
    super(repository);
  }

  async findActiveById(id: string): Promise<ShippingMethod | null> {
    return this.findOne({ where: { id, status: SHIPPING_METHOD_STATUS.ACTIVE } });
  }
}
