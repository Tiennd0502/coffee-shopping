import { render, screen } from '@testing-library/react'
import type React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import RoastsPage from '@/app/(shop)/roasts/page'
import { PAGE_SIZE } from '@/constants/common'
import { useProducts } from '@/hooks/useProduct'
import {
  DISCOUNT_TYPE,
  PRODUCT_STATUS,
  ROAST_LEVEL,
  type Product,
} from '@/types/product'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/hooks/useProduct', () => ({
  useProducts: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    <img alt={alt ?? ''} src={src} {...rest} />
  ),
}))

const mockUsePathname = jest.mocked(usePathname)
const mockUseRouter = jest.mocked(useRouter)
const mockUseSearchParams = jest.mocked(useSearchParams)
const mockUseProducts = jest.mocked(useProducts)

const shopProductFixture: Product[] = [
  {
    id: 'product-1',
    categoryId: 'whole-bean',
    name: 'Ethiopian Yirgacheffe',
    description: 'Floral and citrus profile',
    roastLevel: ROAST_LEVEL.LIGHT,
    isOrganic: true,
    isFairTrade: true,
    status: PRODUCT_STATUS.ACTIVE,
    tastingNotes: 'Lemon, bergamot, jasmine',
    origin: 'Ethiopia',
    processingMethod: 'Washed',
    variants: [
      {
        sku: 'SKU-1',
        weight: 250,
        unit: 'g',
        price: 24,
        discountType: DISCOUNT_TYPE.PERCENT,
        discountValue: 10,
        quantity: 42,
      },
    ],
    images: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0ngZCuIkhGMVirQTIbqtvfqarQ6-b4am3esJOzM2TSdTr84lLHbLlhkT5ZBHMGQgfls4_95hLTBZb464-5Qcamdz4bdtNWwv85SUsugdUY0fTAn12kPSPUQBxQZwlp8zcAnISquJWCjCmrKHUhV4gks0swGFcTLKbGVFVyJLeBy6XtWOjROa2ylkENkFS22a59JgxpfkzOpu3jDAutGavF13QKQp9vKb6vCZVdyYUMzDYQuf5tnefPSj4RN3DcZjuBQFbR5yrCvE',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('Roasts route page', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/roasts')
    mockUseRouter.mockReturnValue({
      replace: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>)
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('') as ReturnType<typeof useSearchParams>,
    )
    mockUseProducts.mockReturnValue({
      products: shopProductFixture,
      meta: {
        limit: PAGE_SIZE,
        currentPage: 1,
        pageCount: 1,
        totalCount: 1,
      },
      isLoading: false,
      isError: false,
      errorMessage: null,
      refetch: jest.fn(),
    })
  })

  it('renders roast page content from products API', () => {
    render(<RoastsPage />)

    expect(
      screen.getByRole('heading', { name: 'The Sensory Brew Shop' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument()
  })
})
