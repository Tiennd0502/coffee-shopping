import * as React from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/utils/styles'

export interface SearchInputProps extends Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'type'
> {
  type?: 'search' | 'text'
  containerClassName?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      placeholder = 'Search...',
      type = 'search',
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        data-slot="search-input"
        className={cn(
          'flex h-10 w-full min-w-0 items-center gap-2 rounded-full bg-input px-4 transition-[box-shadow,opacity] has-[input:disabled]:opacity-60',
          'focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-0 focus-within:outline-none',
          containerClassName,
        )}
      >
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          data-slot="search-input-control"
          placeholder={placeholder}
          className={cn(
            'min-h-0 min-w-0 flex-1 border-0 bg-transparent text-sm leading-normal text-on-surface outline-none placeholder:text-on-surface-variant/80',
            'focus-visible:outline-none disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        <span
          className="pointer-events-none flex shrink-0 text-primary [&_svg]:size-5"
          aria-hidden
        >
          <Search />
        </span>
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'
