import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AuditableEntity } from '@/shared/entities/auditable';
import { DISCOUNT_TYPE, PRODUCT_UNIT } from '@/shared/enums/product';

import { Product } from './product.entity';

@Entity('product_variants')
@Index('UQ_product_variants_sku_active', ['sku'], { unique: true, where: '"deleted_at" IS NULL' })
export class ProductVariant extends AuditableEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'sku', type: 'varchar', length: 100 })
  sku!: string;

  @Column({ name: 'weight', type: 'decimal', precision: 10, scale: 2 })
  weight!: number;

  @Column({ name: 'unit', type: 'enum', enum: PRODUCT_UNIT })
  unit!: PRODUCT_UNIT;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'discount_type', type: 'enum', enum: DISCOUNT_TYPE, nullable: true })
  discountType!: DISCOUNT_TYPE | null;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue!: number | null;

  @Column({ name: 'quantity', type: 'int', default: 0 })
  quantity!: number;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
