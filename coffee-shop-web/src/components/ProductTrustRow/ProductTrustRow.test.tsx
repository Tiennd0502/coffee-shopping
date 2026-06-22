import { render, screen } from '@testing-library/react'

import { ProductTrustRow } from '@/components/ProductTrustRow'
import { SHOP_PDP_TRUST_ITEMS } from '@/constants/product'

describe('ProductTrustRow', () => {
  it('renders all trust item titles', () => {
    render(<ProductTrustRow />)

    for (const item of SHOP_PDP_TRUST_ITEMS) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
    }
  })

  it('exposes data-testid', () => {
    render(<ProductTrustRow />)
    expect(screen.getByTestId('product-trust-row')).toBeInTheDocument()
  })
})
