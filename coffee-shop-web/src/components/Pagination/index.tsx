'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { cn } from '@/utils/styles'

export const DEFAULT_PAGINATION_SIBLING_COUNT = 1

export type PaginationItemToken =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; key: string }

function range(start: number, end: number): number[] {
  if (start > end) return []
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = DEFAULT_PAGINATION_SIBLING_COUNT,
): PaginationItemToken[] {
  if (totalPages < 1) return []

  const totalPageNumbers = siblingCount * 2 + 5

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages).map((page) => ({ type: 'page', page }))
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  const items: PaginationItemToken[] = []

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    for (const page of range(1, leftItemCount)) {
      items.push({ type: 'page', page })
    }
    items.push({ type: 'ellipsis', key: 'end' })
    items.push({ type: 'page', page: totalPages })
    return items
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    items.push({ type: 'page', page: 1 })
    items.push({ type: 'ellipsis', key: 'start' })
    const rightItemCount = 3 + 2 * siblingCount
    for (const page of range(totalPages - rightItemCount + 1, totalPages)) {
      items.push({ type: 'page', page })
    }
    return items
  }

  if (showLeftEllipsis && showRightEllipsis) {
    items.push({ type: 'page', page: 1 })
    items.push({ type: 'ellipsis', key: 'start' })
    for (const page of range(leftSiblingIndex, rightSiblingIndex)) {
      items.push({ type: 'page', page })
    }
    items.push({ type: 'ellipsis', key: 'end' })
    items.push({ type: 'page', page: totalPages })
    return items
  }

  return range(1, totalPages).map((page) => ({ type: 'page', page }))
}

export interface PaginationBarProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showingCount: number
  totalCount: number
  entityLabel?: string
  hideSummary?: boolean
  siblingCount?: number
  className?: string
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  showingCount,
  totalCount,
  entityLabel = 'users',
  hideSummary = false,
  siblingCount = DEFAULT_PAGINATION_SIBLING_COUNT,
  className,
}: PaginationBarProps) {
  if (totalPages < 1) {
    return null
  }

  const items = getPaginationItems(currentPage, totalPages, siblingCount)

  const pageLink = (page: number) => (
    <PaginationItem key={`page-${page}`}>
      <PaginationLink
        href="#"
        isActive={page === currentPage}
        onClick={(e) => {
          e.preventDefault()
          onPageChange(page)
        }}
      >
        {page}
      </PaginationLink>
    </PaginationItem>
  )

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-4',
        className,
      )}
    >
      {!hideSummary && (
        <p className="text-sm" role="status">
          <span className="text-muted-foreground">Showing </span>
          <strong className="font-bold text-foreground">{showingCount}</strong>
          <span className="text-muted-foreground"> of </span>
          <strong className="font-bold text-foreground">{totalCount}</strong>
          <span className="text-muted-foreground"> {entityLabel}</span>
        </p>
      )}
      <Pagination className="mx-0 w-auto shrink-0 justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={currentPage <= 1}
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) onPageChange(currentPage - 1)
              }}
            />
          </PaginationItem>
          {items.map((item) =>
            item.type === 'page' ? (
              pageLink(item.page)
            ) : (
              <PaginationItem key={`ellipsis-${item.key}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              disabled={currentPage >= totalPages}
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) onPageChange(currentPage + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
