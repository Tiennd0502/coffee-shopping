import { render, screen } from '@testing-library/react'

import { ProductDetailSpecGrid } from '@/components/ProductDetailSpecGrid'
import {
  DISCOUNT_TYPE,
  PRODUCT_STATUS,
  ROAST_LEVEL,
  type Product,
} from '@/types/product'

const fixture: Product = {
  id: 'p-1',
  categoryId: 'cat',
  name: 'Ethiopian Yirgacheffe',
  description: 'Floral',
  roastLevel: ROAST_LEVEL.LIGHT,
  isOrganic: true,
  isFairTrade: true,
  status: PRODUCT_STATUS.ACTIVE,
  tastingNotes: 'Jasmine, Bergamot',
  origin: 'Yirgacheffe, Ethiopia',
  processingMethod: 'Washed',
  variants: [
    {
      sku: 's',
      weight: 250,
      unit: 'g',
      price: 24,
      discountType: DISCOUNT_TYPE.PERCENT,
      discountValue: 0,
      quantity: 40,
    },
  ],
  images: [],
  createdAt: null,
  updatedAt: null,
}

describe('ProductDetailSpecGrid', () => {
  it('renders origin and processing from product', () => {
    render(<ProductDetailSpecGrid product={fixture} />)

    expect(screen.getByText('Yirgacheffe, Ethiopia')).toBeInTheDocument()
    expect(screen.getByText('Washed')).toBeInTheDocument()
  })

  it('renders tasting notes in Notes card', () => {
    render(<ProductDetailSpecGrid product={fixture} />)

    expect(screen.getByText('Jasmine, Bergamot')).toBeInTheDocument()
  })

  it('exposes data-testid for integration tests', () => {
    render(<ProductDetailSpecGrid product={fixture} />)
    expect(screen.getByTestId('product-detail-spec-grid')).toBeInTheDocument()
  })
})
