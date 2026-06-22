import { render, screen } from '@testing-library/react'
import type React from 'react'

import HomePage from '@/app/(shop)/page'
import { fetchProducts } from '@/services/product'

jest.mock('@/services/product', () => ({
  fetchProducts: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    priority: _priority,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string
    priority?: boolean
  }) => <img alt={alt ?? ''} src={src} {...rest} />,
}))

const mockFetchProducts = jest.mocked(fetchProducts)

describe('HomePage actions', () => {
  beforeEach(() => {
    mockFetchProducts.mockResolvedValue({
      ok: false,
      error: 'Could not load products',
    })
  })

  it('disables placeholder actions on home page', async () => {
    const page = await HomePage()
    render(page)

    expect(
      screen.queryByRole('link', { name: 'Brew Guides' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Brew Guides - Coming soon')).toHaveAttribute(
      'aria-disabled',
      'true',
    )

    expect(
      screen.queryByRole('link', { name: 'Our Ethical Source' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Our Ethical Source - Coming soon'),
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('keeps valid actions as links', async () => {
    const page = await HomePage()
    render(page)

    expect(
      screen.getByRole('link', { name: 'Shop The Collection' }),
    ).toHaveAttribute('href', '/roasts')
    expect(screen.getByRole('link', { name: 'View All' })).toHaveAttribute(
      'href',
      '/roasts',
    )
  })
})
