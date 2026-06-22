import { Column } from 'typeorm';

import { BaseEntity } from '@/shared/entities/base';

export abstract class AuditableEntity extends BaseEntity {
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedBy!: string | null;
}
