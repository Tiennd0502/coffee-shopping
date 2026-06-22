import {
  ProductResponseSchema,
  type ProductImageResponse,
  type ProductResponse,
  type ProductVariantResponse,
} from './product.dto';
import type { ProductImage } from './product-image.entity';
import type { Product } from './product.entity';
import type { ProductVariant } from './product-variant.entity';

export class ProductMapper {
  static toResponse(product: Product): ProductResponse {
    return ProductResponseSchema.parse({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      roastLevel: product.roastLevel,
      isOrganic: product.isOrganic,
      isFairTrade: product.isFairTrade,
      status: product.status,
      tastingNotes: product.tastingNotes,
      origin: product.origin,
      processingMethod: product.processingMethod,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      variants: (product.variants ?? []).map(ProductMapper.toVariantResponse),
      images: (product.images ?? []).map(ProductMapper.toImageResponse),
    });
  }

  private static toVariantResponse(variant: ProductVariant): ProductVariantResponse {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      weight: Number(variant.weight),
      unit: variant.unit,
      name: variant.name,
      price: Number(variant.price),
      discountType: variant.discountType,
      discountValue: variant.discountValue !== null ? Number(variant.discountValue) : null,
      quantity: variant.quantity,
      createdBy: variant.createdBy,
      updatedBy: variant.updatedBy,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    };
  }

  private static toImageResponse(image: ProductImage): ProductImageResponse {
    return {
      id: image.id,
      productId: image.productId,
      url: image.url,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    };
  }
}
