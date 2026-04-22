import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@/shared/entities/base';

import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'url', type: 'varchar', length: 500 })
  url!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
