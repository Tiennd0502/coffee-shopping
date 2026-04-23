import { Column, Entity } from 'typeorm';

import { VALIDATION_RULES } from '@/shared/constants/validation';
import { BaseEntity } from '@/shared/entities/base';

@Entity('user_addresses')
export class UserAddress extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: VALIDATION_RULES.PHONE.MAX_LENGTH,
  })
  phoneNumber!: string;

  @Column({ name: 'address_line', type: 'varchar', length: 255 })
  addressLine!: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city!: string;

  @Column({ name: 'district', type: 'varchar', length: 100 })
  district!: string;

  @Column({ name: 'ward', type: 'varchar', length: 100 })
  ward!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20 })
  postalCode!: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;
}
