import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  DEFAULT_PAGINATION_SIBLING_COUNT,
  getPaginationItems,
  PaginationBar,
} from '@/components/Pagination'

const defaultSummary = {
  showingCount: 4,
  totalCount: 1284,
}

describe('getPaginationItems (Chakra-style siblingCount)', () => {
  it('uses siblingCount default like Chakra Pagination.Root', () => {
    expect(DEFAULT_PAGINATION_SIBLING_COUNT).toBe(1)
  })

  it('early pages: fixed left block, ellipsis, last page', () => {
    const items = getPaginationItems(1, 20)
    expect(items.map((t) => (t.type === 'page' ? t.page : '…'))).toEqual([
      1,
      2,
      3,
      4,
      5,
      '…',
      20,
    ])
  })

  it('page 2 still shares early block with page 1 (not a sliding window)', () => {
    const items = getPaginationItems(2, 20)
    expect(items.map((t) => (t.type === 'page' ? t.page : '…'))).toEqual([
      1,
      2,
      3,
      4,
      5,
      '…',
      20,
    ])
  })

  it('middle: first, ellipsis, siblings around current, ellipsis, last', () => {
    const items = getPaginationItems(10, 20)
    expect(items.map((t) => (t.type === 'page' ? t.page : '…'))).toEqual([
      1,
      '…',
      9,
      10,
      11,
      '…',
      20,
    ])
  })

  it('near end: first, ellipsis, trailing block', () => {
    const items = getPaginationItems(10, 10)
    expect(items.map((t) => (t.type === 'page' ? t.page : '…'))).toEqual([
      1,
      '…',
      6,
      7,
      8,
      9,
      10,
    ])
  })

  it('small total: all pages, no ellipsis', () => {
    const items = getPaginationItems(2, 7)
    expect(items).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map((page) => ({ type: 'page' as const, page })),
    )
  })
})

describe('PaginationBar', () => {
  it('renders nothing when totalPages is 0', () => {
    const { container } = render(
      <PaginationBar
        currentPage={1}
        totalPages={0}
        onPageChange={jest.fn()}
        {...defaultSummary}
      />,
    )
    expect(
      container.querySelector('[data-slot="pagination"]'),
    ).not.toBeInTheDocument()
  })

  it('shows early block and last for many pages on page 1', () => {
    render(
      <PaginationBar
        currentPage={1}
        totalPages={20}
        onPageChange={jest.fn()}
        {...defaultSummary}
      />,
    )

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '5' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '6' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '20' })).toBeInTheDocument()
    expect(
      document.querySelectorAll('[data-slot="pagination-ellipsis"]'),
    ).toHaveLength(1)
  })

  it('on page 2 still shows 1–5 like Chakra early cluster', () => {
    render(
      <PaginationBar
        currentPage={2}
        totalPages={20}
        onPageChange={jest.fn()}
        {...defaultSummary}
      />,
    )

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '5' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '6' })).not.toBeInTheDocument()
  })

  it('renders summary with counts and default entity label', () => {
    render(
      <PaginationBar
        currentPage={1}
        totalPages={3}
        onPageChange={jest.fn()}
        showingCount={4}
        totalCount={1284}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Showing')
    expect(screen.getByRole('status')).toHaveTextContent('4')
    expect(screen.getByRole('status')).toHaveTextContent('1284')
    expect(screen.getByRole('status')).toHaveTextContent('users')
  })

  it('renders custom entity label', () => {
    render(
      <PaginationBar
        currentPage={1}
        totalPages={2}
        onPageChange={jest.fn()}
        showingCount={10}
        totalCount={99}
        entityLabel="orders"
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('orders')
    expect(screen.getByRole('status')).not.toHaveTextContent('users')
  })

  it('calls onPageChange when a page link is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()

    render(
      <PaginationBar
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
        {...defaultSummary}
      />,
    )

    await user.click(screen.getByRole('link', { name: '2' }))
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('does not change page via previous when on first page', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()

    render(
      <PaginationBar
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
        {...defaultSummary}
      />,
    )

    await user.click(screen.getByLabelText('Go to previous page'))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('advances via next and disables next on last page', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()

    const { rerender } = render(
      <PaginationBar
        currentPage={2}
        totalPages={3}
        onPageChange={onPageChange}
        {...defaultSummary}
      />,
    )

    await user.click(screen.getByLabelText('Go to next page'))
    expect(onPageChange).toHaveBeenCalledWith(3)

    onPageChange.mockClear()
    rerender(
      <PaginationBar
        currentPage={3}
        totalPages={3}
        onPageChange={onPageChange}
        {...defaultSummary}
      />,
    )

    await user.click(screen.getByLabelText('Go to next page'))
    expect(onPageChange).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('link', { name: 'Go to next page' }),
    ).not.toBeInTheDocument()
  })
})
