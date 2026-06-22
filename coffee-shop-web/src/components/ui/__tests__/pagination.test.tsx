import { render, screen } from '@testing-library/react'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from '@/components/ui/pagination'

describe('Pagination', () => {
  it('renders navigation landmark', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toBeInTheDocument()
  })

  it('marks active page with aria-current', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: '2' })).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
    )
  })

  it('renders disabled previous as non-link', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(
      screen.queryByRole('link', { name: 'Go to previous page' }),
    ).not.toBeInTheDocument()
    const prev = screen.getByLabelText('Go to previous page')
    expect(prev.tagName).toBe('SPAN')
    expect(prev).toHaveAttribute('aria-disabled', 'true')
  })

  it('applies inactive chip surface class', () => {
    render(
      <PaginationLink href="#" className="extra">
        3
      </PaginationLink>,
    )

    expect(screen.getByRole('link', { name: '3' })).toHaveClass(
      'bg-pagination-surface',
      'extra',
    )
  })
})
