import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@/shared/entities/base';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from '@/shared/enums/order';
import { User } from '@/modules/user/user.entity';

import { OrderItem } from './order-item.entity';
import { ShippingMethod } from './shipping-method.entity';

/** Address and contact copied onto the order at checkout. */
export type OrderAddressSnapshot = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  addressLine?: string;
  city?: string;
  district?: string;
  ward?: string;
  postalCode?: string;
};

@Entity('orders')
@Index('UQ_orders_order_number_active', ['orderNumber'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class Order extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;

  @Column({ name: 'shipping_method_id', type: 'uuid' })
  shippingMethodId!: string;

  @Column({ name: 'order_number', type: 'varchar', length: 50 })
  orderNumber!: string;

  @Column({ name: 'status', type: 'enum', enum: ORDER_STATUS, default: ORDER_STATUS.PENDING })
  status!: ORDER_STATUS;

  @Column({
    name: 'shipping_status',
    type: 'enum',
    enum: SHIPPING_STATUS,
    default: SHIPPING_STATUS.PENDING,
  })
  shippingStatus!: SHIPPING_STATUS;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.UNPAID,
  })
  paymentStatus!: PAYMENT_STATUS;

  @Column({ name: 'payment_method', type: 'enum', enum: PAYMENT_METHOD })
  paymentMethod!: PAYMENT_METHOD;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 12, scale: 2 })
  shippingFee!: number;

  @Column({ name: 'shipping_method_name', type: 'varchar', length: 120 })
  shippingMethodName!: string;

  @Column({ name: 'sub_total', type: 'decimal', precision: 12, scale: 2 })
  subTotal!: number;

  @Column({ name: 'tax', type: 'decimal', precision: 12, scale: 2 })
  tax!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'address_snapshot', type: 'jsonb' })
  addressSnapshot!: OrderAddressSnapshot;

  @Column({ name: 'note', type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => ShippingMethod)
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod!: ShippingMethod;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @OneToMany(() => OrderItem, (item: OrderItem) => item.order, { cascade: ['insert'] })
  items!: OrderItem[];
}
