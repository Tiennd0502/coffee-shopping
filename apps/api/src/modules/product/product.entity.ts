import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AuditableEntity } from '@/shared/entities/auditable';
import { PRODUCT_STATUS, ROAST_LEVEL } from '@/shared/enums/product';
import { Category } from '@/modules/category/category.entity';

import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
@Index('UQ_products_slug_active', ['slug'], { unique: true, where: '"deleted_at" IS NULL' })
export class Product extends AuditableEntity {
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'slug', type: 'varchar', length: 220 })
  slug!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'roast_level', type: 'enum', enum: ROAST_LEVEL })
  roastLevel!: ROAST_LEVEL;

  @Column({ name: 'is_organic', type: 'boolean', default: false })
  isOrganic!: boolean;

  @Column({ name: 'is_fair_trade', type: 'boolean', default: false })
  isFairTrade!: boolean;

  @Column({ name: 'status', type: 'enum', enum: PRODUCT_STATUS, default: PRODUCT_STATUS.DRAFT })
  status!: PRODUCT_STATUS;

  @Column({ name: 'tasting_notes', type: 'text', nullable: true })
  tastingNotes!: string | null;

  @Column({ name: 'origin', type: 'varchar', length: 100, nullable: true })
  origin!: string | null;

  @Column({ name: 'processing_method', type: 'varchar', length: 100, nullable: true })
  processingMethod!: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: ['insert'] })
  variants!: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: ['insert'] })
  images!: ProductImage[];
}
