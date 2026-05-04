import { In, type FindOptionsWhere, type Repository } from 'typeorm';

import { BaseRepository } from '@/shared/repositories/base.repository';

import type { CreateProductImageInput } from './product.dto';
import { ProductImage } from './product-image.entity';

export class ProductImageRepository extends BaseRepository<ProductImage> {
  constructor(repository: Repository<ProductImage>) {
    super(repository);
  }

  async findByProductId(productId: string): Promise<ProductImage[]> {
    return this.find({
      where: { productId } as unknown as FindOptionsWhere<ProductImage>,
    });
  }

  async findByProductIdAndIds(productId: string, ids: string[]): Promise<ProductImage[]> {
    if (!ids.length) {
      return [];
    }

    return this.find({
      where: { productId, id: In(ids) } as unknown as FindOptionsWhere<ProductImage>,
    });
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (!ids.length) {
      return;
    }

    await this.getRepository().softDelete({
      id: In(ids),
    } as unknown as FindOptionsWhere<ProductImage>);
  }

  createMany(images: CreateProductImageInput[]): ProductImage[] {
    return images.map((image) => this.create(image));
  }

  createManyForProduct(images: CreateProductImageInput[], productId: string): ProductImage[] {
    return this.getRepository().create(images.map((image) => ({ ...image, productId })));
  }

  async saveMany(images: ProductImage[]): Promise<void> {
    if (!images.length) {
      return;
    }

    await this.getRepository().save(images);
  }
}
