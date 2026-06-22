import { render, screen } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Sidebar as ContainerSidebar,
  SidebarProvider,
} from '@/components/ui/sidebar'
import Sidebar from '@/components/Sidebar'
import { usePathname } from 'next/navigation'

const mockUsePathname = jest.mocked(usePathname)
const mockUseIsMobile = jest.fn(() => false)

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    alt: string
    priority?: boolean
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

jest.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

const renderSidebar = () => {
  return render(
    <TooltipProvider delay={0}>
      <SidebarProvider defaultOpen>
        <ContainerSidebar collapsible="icon" variant="inset">
          <Sidebar />
        </ContainerSidebar>
      </SidebarProvider>
    </TooltipProvider>,
  )
}

describe('Dashboard Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard')
    mockUseIsMobile.mockReturnValue(false)
  })

  it('renders enabled item as link', () => {
    renderSidebar()

    expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute(
      'href',
      '/dashboard/products',
    )
  })

  it('renders disabled menu item as non-navigable button', () => {
    renderSidebar()

    expect(
      screen.queryByRole('link', { name: /favorites/i }),
    ).not.toBeInTheDocument()

    const disabledButton = screen.getByRole('button', {
      name: /favorites - coming soon/i,
    })

    expect(disabledButton).toHaveAttribute('aria-disabled', 'true')
    expect(disabledButton).toHaveAttribute('tabindex', '-1')
    expect(disabledButton).toHaveClass('cursor-not-allowed')
  })

  it('does not mark disabled route as active even when pathname matches', () => {
    mockUsePathname.mockReturnValue('/dashboard/favorites')
    renderSidebar()

    const disabledButton = screen.getByRole('button', {
      name: /favorites - coming soon/i,
    })

    expect(disabledButton).not.toHaveAttribute('data-active', 'true')
  })

  it('marks enabled item active when pathname matches', () => {
    mockUsePathname.mockReturnValue('/dashboard/products')
    renderSidebar()

    const productsLink = screen.getByRole('link', { name: /products/i })

    expect(productsLink).toHaveAttribute('aria-current', 'page')
    expect(
      productsLink.closest('[data-slot="sidebar-menu-button"]'),
    ).toHaveAttribute('data-active')
  })
})
