import { formatPrice } from '@/utils/common'
import type { CartItem, CartTotals } from '@/types/cart'

const DEFAULT_MAX_QUANTITY = 99

export const clampQuantity = (
  quantity: number,
  maxQuantity = DEFAULT_MAX_QUANTITY,
): number => {
  if (maxQuantity <= 0) {
    if (!Number.isFinite(quantity)) return 0
    return Math.max(0, Math.trunc(quantity))
  }

  const safeMax = Math.max(1, Math.min(maxQuantity, DEFAULT_MAX_QUANTITY))

  if (!Number.isFinite(quantity)) return 1
  return Math.max(1, Math.min(Math.trunc(quantity), safeMax))
}

export const calculateSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

export const calculateTotal = ({
  subtotal,
  shipping,
  tax,
}: {
  subtotal: number
  shipping: number | null
  tax: number
}): number => subtotal + (shipping ?? 0) + tax

export const buildCartTotals = (items: CartItem[]): CartTotals => {
  const subtotal = calculateSubtotal(items)
  const shipping = null
  const tax = 0

  return {
    subtotal,
    shipping,
    tax,
    total: calculateTotal({ subtotal, shipping, tax }),
  }
}

export const formatCurrency = (amount: number): string => formatPrice(amount)
