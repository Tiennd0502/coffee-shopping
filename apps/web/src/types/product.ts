import {
  type ROAST_LEVEL,
  type PRODUCT_UNIT,
  type DISCOUNT_TYPE,
  type PRODUCT_STATUS,
} from '@repo/types';

interface ProductVariantBase {
  sku?: string;
  weight: number;
  unit: PRODUCT_UNIT;
  price: number;
  discountType: DISCOUNT_TYPE | null;
  discountValue: number | null;
  quantity: number;
}

export interface ProductVariantPayload extends ProductVariantBase {
  id?: string;
}

export interface ProductVariant extends ProductVariantBase {
  id: string;
  productId: string;
  name: string;
}

export interface ProductImagePayload {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductImage extends ProductImagePayload {
  id?: string;
}

export interface ProductImageUpdatePayload {
  id: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface ProductBase {
  categoryId: string;
  name: string;
  description: string;
  roastLevel: ROAST_LEVEL;
  isOrganic: boolean;
  isFairTrade: boolean;
  status: PRODUCT_STATUS;
  tastingNotes: string;
  origin: string;
  processingMethod: string;
}

export interface ProductPayload extends ProductBase {
  variants: ProductVariantPayload[];
  images: ProductImagePayload[];
}

export interface ProductUpdatePayload extends ProductBase {
  addImages: ProductImagePayload[];
  removeImageIds: string[];
  updateImages: ProductImageUpdatePayload[];
}

export interface Product extends ProductBase {
  id: string;
  variants: ProductVariantPayload[];
  images: ProductImage[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProductFormValues extends ProductBase {
  weight: number;
  unit: PRODUCT_UNIT | '';
  price: number;
  discountType: DISCOUNT_TYPE;
  discountValue: number;
  quantity: number;
}
