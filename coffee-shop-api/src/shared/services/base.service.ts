import type { ObjectLiteral } from 'typeorm';

import { NotFoundError } from '@/shared/errors/app';
import type { BaseRepository } from '@/shared/repositories/base.repository';

export abstract class BaseService<T extends ObjectLiteral, TRepo extends BaseRepository<T>> {
  constructor(protected readonly repository: TRepo) {}

  protected async assertById(id: string, entityName: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(entityName);
    }

    return entity;
  }
}
