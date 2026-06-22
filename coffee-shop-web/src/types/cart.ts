export interface CartItem {
  id: string
  variantId: string
  productId: string
  name: string
  meta: string
  imageUrl: string
  unitPrice: number
  quantity: number
  maxQuantity?: number
}

export interface CartTotals {
  subtotal: number
  shipping: number | null
  tax: number
  total: number
}

export interface CartAddItemInput {
  variantId: string
  productId: string
  name: string
  meta: string
  imageUrl: string
  unitPrice: number
  quantity: number
  maxQuantity?: number
}
