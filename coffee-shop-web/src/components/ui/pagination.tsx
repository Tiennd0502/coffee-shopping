import * as React from 'react'

import { cn } from '@/utils/styles'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & React.ComponentProps<'a'>

function paginationChipClassName(
  isActive: boolean | undefined,
  disabled: boolean | undefined,
) {
  return cn(
    'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent',
    'text-sm font-semibold outline-none transition-[color,background-color,box-shadow,opacity]',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    isActive
      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
      : 'bg-pagination-surface text-foreground hover:opacity-90',
    disabled &&
      'pointer-events-none cursor-not-allowed text-muted-foreground opacity-45 hover:opacity-45',
  )
}

function PaginationLink({
  className,
  isActive,
  disabled,
  href,
  ...props
}: PaginationLinkProps) {
  const chipClassName = cn(
    paginationChipClassName(isActive, disabled),
    className,
  )

  if (disabled) {
    return (
      <span
        data-slot="pagination-link"
        data-active={isActive ? true : undefined}
        aria-disabled="true"
        className={chipClassName}
        {...props}
      />
    )
  }

  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive ? true : undefined}
      href={href ?? '#'}
      className={chipClassName}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  disabled,
  ...props
}: Omit<PaginationLinkProps, 'isActive'>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      disabled={disabled}
      className={cn('gap-0 p-0', className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" aria-hidden />
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  disabled,
  ...props
}: Omit<PaginationLinkProps, 'isActive'>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      disabled={disabled}
      className={cn('gap-0 p-0', className)}
      {...props}
    >
      <ChevronRightIcon className="size-4" aria-hidden />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-10 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
