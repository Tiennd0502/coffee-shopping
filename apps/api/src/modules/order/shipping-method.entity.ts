import { Column, Entity } from 'typeorm';

import { AuditableEntity } from '@/shared/entities/auditable';
import { SHIPPING_METHOD_STATUS } from '@repo/types';

@Entity('shipping_methods')
export class ShippingMethod extends AuditableEntity {
  @Column({ name: 'name', type: 'varchar', length: 120 })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SHIPPING_METHOD_STATUS,
    default: SHIPPING_METHOD_STATUS.ACTIVE,
  })
  status!: SHIPPING_METHOD_STATUS;
}
