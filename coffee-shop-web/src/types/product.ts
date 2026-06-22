export enum ROAST_LEVEL {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  DARK = 'DARK',
}

export enum PRODUCT_UNIT {
  KG = 'KG',
  G = 'G',
  L = 'L',
  ML = 'ML',
}

export enum DISCOUNT_TYPE {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum PRODUCT_STATUS {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export type ProductStatus = PRODUCT_STATUS

export interface ProductVariantPayload {
  id?: string
  sku?: string
  weight: number
  unit: PRODUCT_UNIT
  price: number
  discountType: DISCOUNT_TYPE | null
  discountValue: number | null
  quantity: number
}

export interface ProductVariant {
  id: string
  productId: string
  sku?: string
  weight: number
  unit: PRODUCT_UNIT
  name: string
  price: number
  discountType: DISCOUNT_TYPE | null
  discountValue: number | null
  quantity: number
}

export interface ProductImagePayload {
  url: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductImage extends ProductImagePayload {
  id?: string
}

export interface ProductImageUpdatePayload {
  id: string
  sortOrder: number
  isPrimary: boolean
}

export interface ProductPayload {
  categoryId: string
  name: string
  description: string
  roastLevel: ROAST_LEVEL
  isOrganic: boolean
  isFairTrade: boolean
  status: ProductStatus
  tastingNotes: string
  origin: string
  processingMethod: string
  variants: ProductVariantPayload[]
  images: ProductImagePayload[]
}

export interface ProductUpdatePayload extends Omit<
  ProductPayload,
  'images' | 'variants'
> {
  addImages: ProductImagePayload[]
  removeImageIds: string[]
  updateImages: ProductImageUpdatePayload[]
}

export interface Product {
  id: string
  categoryId: string
  name: string
  description: string
  roastLevel: ROAST_LEVEL
  isOrganic: boolean
  isFairTrade: boolean
  status: ProductStatus
  tastingNotes: string
  origin: string
  processingMethod: string
  variants: ProductVariantPayload[]
  images: ProductImage[]
  createdAt: string | null
  updatedAt: string | null
}

export interface ProductFormValues {
  categoryId: string
  name: string
  description: string
  roastLevel: ROAST_LEVEL
  isOrganic: boolean
  isFairTrade: boolean
  weight: number
  unit: PRODUCT_UNIT | ''
  price: number
  discountType: DISCOUNT_TYPE
  discountValue: number
  quantity: number
  origin: string
  processingMethod: string
}
