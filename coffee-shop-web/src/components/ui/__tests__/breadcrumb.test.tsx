import { render, screen, within } from '@testing-library/react'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

describe('Breadcrumb', () => {
  it('renders a navigation landmark with breadcrumb label', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )

    expect(
      screen.getByRole('navigation', { name: 'breadcrumb' }),
    ).toBeInTheDocument()
  })

  it('renders links for prior crumbs and current page without an anchor', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )

    const dashboard = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboard).toHaveAttribute('href', '/dashboard')

    const orders = screen.getByText('Orders')
    expect(orders.tagName).toBe('SPAN')
    expect(orders).toHaveAttribute('aria-current', 'page')
    expect(orders).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders separators between items with presentation semantics', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/a">A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/b">B</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>C</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )

    const separators = document.querySelectorAll(
      '[data-slot="breadcrumb-separator"]',
    )
    expect(separators).toHaveLength(2)
    separators.forEach((el) => {
      expect(el).toHaveAttribute('role', 'presentation')
      expect(el).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('applies list typography classes on BreadcrumbList', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList data-testid="crumb-list">
          <BreadcrumbItem>
            <BreadcrumbPage>Only</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )

    const list = screen.getByTestId('crumb-list')
    expect(list).toHaveClass('text-muted-foreground')
    expect(list.tagName).toBe('OL')
  })

  it('exposes ellipsis with screen-reader fallback', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )

    expect(
      screen.getByText('More', { selector: '.sr-only' }),
    ).toBeInTheDocument()
    const ellipsisHost = document.querySelector(
      '[data-slot="breadcrumb-ellipsis"]',
    )
    expect(ellipsisHost).toHaveAttribute('aria-hidden', 'true')
  })

  it('wraps structure in breadcrumb data-slot on nav', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>X</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
    expect(nav).toHaveAttribute('data-slot', 'breadcrumb')
    const item = within(nav)
      .getByText('X')
      .closest('[data-slot="breadcrumb-item"]')
    expect(item).toBeInTheDocument()
  })
})
