import { render, screen } from '@testing-library/react'

import Breadcrumb from '@/components/Breadcrumb'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

const mockUsePathname = jest.mocked(usePathname)

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders nothing when items is empty', () => {
    const { container } = render(<Breadcrumb items={[]} />)
    expect(
      container.querySelector('[data-slot="breadcrumb"]'),
    ).not.toBeInTheDocument()
  })

  it('renders links for inactive items and current page when pathname matches href', () => {
    mockUsePathname.mockReturnValue('/admin/products')

    render(
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
        ]}
      />,
    )

    expect(
      screen.getByRole('navigation', { name: 'breadcrumb' }),
    ).toBeInTheDocument()

    const admin = screen.getByRole('link', { name: 'Admin' })
    expect(admin).toHaveAttribute('href', '/admin')
    expect(admin).toHaveClass('text-muted-foreground')

    const products = screen.getByText('Products')
    expect(products.tagName).toBe('SPAN')
    expect(products).toHaveAttribute('aria-current', 'page')
    expect(products).toHaveClass('text-primary')
  })

  it('inserts separators between items', () => {
    mockUsePathname.mockReturnValue('/components/breadcrumb')

    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Breadcrumb', href: '/components/breadcrumb' },
        ]}
      />,
    )

    expect(
      document.querySelectorAll('[data-slot="breadcrumb-separator"]'),
    ).toHaveLength(2)
  })
})
