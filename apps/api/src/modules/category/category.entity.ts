import { BaseEntity } from '@/shared/entities/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * Name uniqueness applies only to non-soft-deleted rows so values can be reused
 * after the previous row was soft-deleted.
 */
@Entity('categories')
@Index('UQ_categories_name_active', ['name'], { unique: true, where: '"deleted_at" IS NULL' })
export class Category extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'slug', type: 'varchar', length: 120 })
  slug!: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedBy!: string | null;
}
