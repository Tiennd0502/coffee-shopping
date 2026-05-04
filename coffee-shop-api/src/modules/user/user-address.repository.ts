import type { Repository } from 'typeorm';

import { BaseRepository } from '@/shared/repositories/base.repository';

import { UserAddress } from './user-address.entity';

export class UserAddressRepository extends BaseRepository<UserAddress> {
  constructor(repository: Repository<UserAddress>) {
    super(repository);
  }

  async findByUserId(userId: string): Promise<UserAddress[]> {
    return this.find({ where: { userId } });
  }
}
