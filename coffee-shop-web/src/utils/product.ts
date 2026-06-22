import type { UploadImageGalleryItem } from '@/components/UploadImage/Gallery'
import { OUT_OF_STOCK_LABEL } from '@/constants/order'
import { type RoastCollection } from '@/constants/roast'
import type { EditProductFormValues } from '@/schemas/product'
import {
  DISCOUNT_TYPE,
  ROAST_LEVEL,
  type Product,
  type ProductFormValues,
  type ProductImage,
  type ProductImagePayload,
  type ProductImageUpdatePayload,
} from '@/types/product'
import { getPrimaryVariantQuantity } from '@/utils/inventory'

export const LOW_STOCK_THRESHOLD = 10

function formatProductRoastMeta(product: Product): string {
  const levelLabel: Record<ROAST_LEVEL, string> = {
    [ROAST_LEVEL.LIGHT]: 'Light roast',
    [ROAST_LEVEL.MEDIUM]: 'Medium roast',
    [ROAST_LEVEL.DARK]: 'Dark roast',
  }
  const origin = product.origin?.trim()
  const roast = levelLabel[product.roastLevel]
  if (origin) {
    return `${origin} | ${roast}`
  }
  return roast
}

function productFlavorLine(product: Product): string {
  const notes = product.tastingNotes?.trim()
  if (notes) return notes
  const description = product.description?.trim()
  if (description) return description
  return '—'
}

export function getProductListPrice(product: Product): number {
  const firstVariant = product.variants[0]
  if (!firstVariant) return 0
  return Number.isFinite(firstVariant.price) ? firstVariant.price : 0
}

export function getProductPrimaryImageUrl(product: Product): string | null {
  if (product.images.length === 0) return null
  const primary = product.images.find((image) => image.isPrimary)
  const first = primary ?? product.images[0]
  const url = first?.url?.trim() ?? ''
  return url || null
}

export function mapProductToRoastCollection(
  product: Product,
  placeholderImageUrl: string,
): RoastCollection {
  const price = getProductListPrice(product)
  const imageUrl = getProductPrimaryImageUrl(product) ?? placeholderImageUrl
  const quantity = getPrimaryVariantQuantity(product)
  let badgeLabel: string | undefined
  if (quantity <= 0) {
    badgeLabel = OUT_OF_STOCK_LABEL
  } else if (quantity < LOW_STOCK_THRESHOLD) {
    badgeLabel = 'Low Stock'
  }

  return {
    id: product.id,
    name: product.name,
    price,
    flavorNotes: productFlavorLine(product),
    roastMeta: formatProductRoastMeta(product),
    roastLevel: product.roastLevel,
    imageUrl,
    badgeLabel,
  }
}

export function parseTastingNotesString(notes: string): string[] {
  return notes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function mapProductToEditFormValues(
  product: Product,
): EditProductFormValues {
  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    roastLevel: product.roastLevel,
    isOrganic: product.isOrganic,
    isFairTrade: product.isFairTrade,
    origin: product.origin,
    processingMethod: product.processingMethod,
  }
}

export function mapProductToFormValues(product: Product): ProductFormValues {
  const variant = product.variants[0]
  const hasDiscount =
    Number(variant?.discountValue) > 0 &&
    Number.isFinite(Number(variant?.discountValue))

  const discountType =
    variant?.discountType === DISCOUNT_TYPE.FIXED
      ? DISCOUNT_TYPE.FIXED
      : DISCOUNT_TYPE.PERCENT

  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    roastLevel: product.roastLevel,
    isOrganic: product.isOrganic,
    isFairTrade: product.isFairTrade,
    weight: variant?.weight ?? 0,
    unit: variant?.unit ?? '',
    price: variant?.price ?? 0,
    discountType,
    discountValue: hasDiscount ? (variant?.discountValue ?? 0) : 0,
    quantity: variant?.quantity ?? 0,
    origin: product.origin,
    processingMethod: product.processingMethod,
  }
}

export function splitProductImagesForGallery(product: Product): {
  primaryUrl: string | null
  galleryItems: UploadImageGalleryItem[]
} {
  if (!product.images.length) {
    return { primaryUrl: null, galleryItems: [] }
  }

  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
  const primary = sorted.find((image) => image.isPrimary) ?? sorted[0] ?? null
  const primaryUrl = primary?.url?.trim() ? primary.url.trim() : null

  const galleryItems: UploadImageGalleryItem[] = sorted
    .filter((image) => image !== primary)
    .map((image, index) => {
      const persistedId = image.id?.trim()
      return {
        id:
          persistedId !== undefined && persistedId !== ''
            ? persistedId
            : `existing-${index}-${image.sortOrder}`,
        url: image.url,
        name: `Gallery ${index + 1}`,
      }
    })

  return { primaryUrl, galleryItems }
}

function normalizeImageUrl(url: string): string {
  return url.trim()
}

export interface ProductUpdateImageDiff {
  addImages: ProductImagePayload[]
  removeImageIds: string[]
  updateImages: ProductImageUpdatePayload[]
}

/**
 * Builds addImages / removeImageIds / updateImages from full desired image list vs initial API state.
 */
export function buildProductUpdateImageDiff(
  initialImages: ProductImage[],
  finalImages: ProductImagePayload[],
): ProductUpdateImageDiff {
  const finalByUrl = new Map(
    finalImages.map((img) => [normalizeImageUrl(img.url), img]),
  )
  const initialByUrl = new Map(
    initialImages.map((img) => [normalizeImageUrl(img.url), img]),
  )

  const removeImageIds: string[] = []
  for (const img of initialImages) {
    const id = img.id?.trim()
    if (!id) continue
    const url = normalizeImageUrl(img.url)
    if (!finalByUrl.has(url)) {
      removeImageIds.push(id)
    }
  }

  const addImages: ProductImagePayload[] = []
  const updateImages: ProductImageUpdatePayload[] = []

  for (const fin of finalImages) {
    const url = normalizeImageUrl(fin.url)
    const init = initialByUrl.get(url)

    if (!init) {
      addImages.push(fin)
      continue
    }

    const persistedId = init.id?.trim()
    if (
      persistedId &&
      (init.sortOrder !== fin.sortOrder || init.isPrimary !== fin.isPrimary)
    ) {
      updateImages.push({
        id: persistedId,
        sortOrder: fin.sortOrder,
        isPrimary: fin.isPrimary,
      })
    }
  }

  return { addImages, removeImageIds, updateImages }
}
