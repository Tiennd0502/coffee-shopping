import { fireEvent, render, screen } from '@testing-library/react'

import { ProductTableRow } from '@/sections/ProductTableRow'
import { DISCOUNT_TYPE, PRODUCT_STATUS, ROAST_LEVEL } from '@/types/product'

const baseProduct = {
  id: 'p-1',
  categoryId: 'cat-1',
  name: 'Test Product',
  description: '',
  roastLevel: ROAST_LEVEL.LIGHT,
  isOrganic: true,
  isFairTrade: true,
  status: PRODUCT_STATUS.ACTIVE,
  tastingNotes: '',
  origin: 'Ethiopia',
  processingMethod: 'Washed',
  variants: [
    {
      sku: 'S1',
      weight: 250,
      unit: 'g',
      price: 12,
      discountType: DISCOUNT_TYPE.PERCENT,
      discountValue: 0,
      quantity: 1,
    },
  ],
  images: [],
  createdAt: null,
  updatedAt: null,
}

describe('ProductTableRow', () => {
  it('calls onRequestDelete when delete is clicked', () => {
    const onRequestDelete = jest.fn()
    render(
      <table>
        <tbody>
          <tr>
            <ProductTableRow
              product={baseProduct}
              categoryOptions={[{ value: 'cat-1', label: 'Cat' }]}
              onRequestDelete={onRequestDelete}
            />
          </tr>
        </tbody>
      </table>,
    )
    fireEvent.click(
      screen.getByRole('button', { name: /delete test product/i }),
    )
    expect(onRequestDelete).toHaveBeenCalledTimes(1)
    expect(onRequestDelete).toHaveBeenCalledWith(baseProduct)
  })

  it('disables delete when onRequestDelete is not provided', () => {
    render(
      <table>
        <tbody>
          <tr>
            <ProductTableRow
              product={baseProduct}
              categoryOptions={[{ value: 'cat-1', label: 'Cat' }]}
            />
          </tr>
        </tbody>
      </table>,
    )
    expect(
      screen.getByRole('button', { name: /delete test product/i }),
    ).toBeDisabled()
  })

  it('shows full category label in badge (wraps instead of clipping)', () => {
    const categoryName = 'Ground Coffee'

    render(
      <table>
        <tbody>
          <tr>
            <ProductTableRow
              product={baseProduct}
              categoryOptions={[{ value: 'cat-1', label: categoryName }]}
            />
          </tr>
        </tbody>
      </table>,
    )

    expect(screen.getByText(categoryName)).toBeVisible()
  })

  it('sets title on product name for long labels', () => {
    const longName = 'A'.repeat(120)

    render(
      <table>
        <tbody>
          <tr>
            <ProductTableRow
              product={{ ...baseProduct, name: longName }}
              categoryOptions={[{ value: 'cat-1', label: 'Cat' }]}
            />
          </tr>
        </tbody>
      </table>,
    )

    const nameEl = screen.getByText(longName)
    expect(nameEl).toHaveAttribute('title', longName)
  })
})
