import {
  buildCartTotals,
  calculateSubtotal,
  clampQuantity,
  formatCurrency,
} from '@/utils/cart'
import type { CartItem } from '@/types/cart'

const cartItemsFixture: CartItem[] = [
  {
    id: 'line-1',
    variantId: 'line-1',
    productId: 'product-1',
    name: 'Ethiopian Yirgacheffe',
    meta: 'Light Roast',
    imageUrl: '/images/empty-image.webp',
    unitPrice: 24,
    quantity: 1,
  },
  {
    id: 'line-2',
    variantId: 'line-2',
    productId: 'product-2',
    name: 'Precision Gooseneck Kettle',
    meta: 'Matte Black',
    imageUrl: '/images/empty-image.webp',
    unitPrice: 145,
    quantity: 1,
  },
]

describe('clampQuantity', () => {
  it('clamps to 1 at the lower bound', () => {
    expect(clampQuantity(0)).toBe(1)
    expect(clampQuantity(-5)).toBe(1)
  })

  it('clamps to max at the upper bound', () => {
    expect(clampQuantity(100)).toBe(99)
    expect(clampQuantity(8, 3)).toBe(3)
  })

  it('returns an integer value inside bounds', () => {
    expect(clampQuantity(2.8)).toBe(2)
    expect(clampQuantity(Number.NaN)).toBe(1)
  })
})

describe('cart totals helpers', () => {
  it('calculates subtotal from cart lines', () => {
    expect(calculateSubtotal(cartItemsFixture)).toBe(169)
  })

  it('builds totals with checkout-calculated shipping', () => {
    expect(buildCartTotals(cartItemsFixture)).toEqual({
      subtotal: 169,
      shipping: null,
      tax: 0,
      total: 169,
    })
  })
})

describe('formatCurrency', () => {
  it('formats price with usd format', () => {
    expect(formatCurrency(169)).toBe('$169.00')
  })
})
