import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Product } from '@/modules/product/product.entity';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import { BaseEntity } from '@/shared/entities/base';

import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId!: string;

  @Column({ name: 'product_name', type: 'varchar', length: 200 })
  productName!: string;

  @Column({ name: 'product_image', type: 'varchar', length: 500, nullable: true })
  productImage!: string | null;

  @Column({ name: 'variant_name', type: 'varchar', length: 100 })
  variantName!: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
  discountAmount!: number;

  @Column({ name: 'final_price', type: 'decimal', precision: 10, scale: 2 })
  finalPrice!: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity!: number;

  @Column({ name: 'sub_total', type: 'decimal', precision: 12, scale: 2 })
  subTotal!: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;
}
