import { PRODUCT_STATUS, ROAST_LEVEL, type Product } from '@/types/product'
import { mapProductToRoastCollection } from '@/utils/product'

const PLACEHOLDER = 'https://example.com/placeholder.jpg'

describe('mapProductToRoastCollection', () => {
  it('maps API product to shop grid item', () => {
    const product: Product = {
      id: 'p-1',
      categoryId: 'cat',
      name: 'Test Bean',
      description: 'Smooth',
      roastLevel: ROAST_LEVEL.MEDIUM,
      isOrganic: false,
      isFairTrade: false,
      status: PRODUCT_STATUS.ACTIVE,
      tastingNotes: 'Chocolate, caramel',
      origin: 'Colombia',
      processingMethod: 'Washed',
      variants: [
        {
          sku: 's',
          weight: 250,
          unit: 'g',
          price: 18.5,
          discountType: null,
          discountValue: null,
          quantity: 50,
        },
      ],
      images: [],
      createdAt: null,
      updatedAt: null,
    }

    const item = mapProductToRoastCollection(product, PLACEHOLDER)

    expect(item.id).toBe('p-1')
    expect(item.name).toBe('Test Bean')
    expect(item.price).toBe(18.5)
    expect(item.roastLevel).toBe(ROAST_LEVEL.MEDIUM)
    expect(item.imageUrl).toBe(PLACEHOLDER)
    expect(item.flavorNotes).toBe('Chocolate, caramel')
    expect(item.roastMeta).toContain('Colombia')
    expect(item.roastMeta).toContain('Medium roast')
    expect(item.badgeLabel).toBeUndefined()
  })

  it('sets low stock badge when quantity is below threshold', () => {
    const product: Product = {
      id: 'p-2',
      categoryId: 'cat',
      name: 'Low Stock Bean',
      description: '',
      roastLevel: ROAST_LEVEL.DARK,
      isOrganic: false,
      isFairTrade: false,
      status: PRODUCT_STATUS.ACTIVE,
      tastingNotes: '',
      origin: '',
      processingMethod: '',
      variants: [
        {
          sku: 's',
          weight: 250,
          unit: 'g',
          price: 20,
          discountType: null,
          discountValue: null,
          quantity: 3,
        },
      ],
      images: [],
      createdAt: null,
      updatedAt: null,
    }

    const item = mapProductToRoastCollection(product, PLACEHOLDER)
    expect(item.badgeLabel).toBe('Low Stock')
  })
})
