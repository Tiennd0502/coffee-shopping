import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { Menu } from '@/components/Menu'
import { MENU } from '@/constants/nav'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

const mockUsePathname = jest.mocked(usePathname)

describe('Menu', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
  })

  it('renders enabled menu item as link', () => {
    render(<Menu items={MENU} />)

    expect(screen.getByRole('link', { name: 'Roasts' })).toHaveAttribute(
      'href',
      '/roasts',
    )
  })

  it('renders disabled menu item as non-link element', () => {
    render(<Menu items={MENU} />)

    expect(
      screen.queryByRole('link', { name: 'Brew Guides' }),
    ).not.toBeInTheDocument()

    const disabledItem = screen.getByText('Brew Guides')
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    expect(disabledItem).toHaveAttribute('tabindex', '-1')
  })

  it('does not set active state for disabled menu item', () => {
    mockUsePathname.mockReturnValue('/brew-guides')
    render(<Menu items={MENU} />)

    expect(screen.queryByRole('link', { name: 'Brew Guides' })).toBeNull()
  })
})
