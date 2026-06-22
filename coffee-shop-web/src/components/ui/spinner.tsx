import { Loader2 } from 'lucide-react'
import { type ComponentProps } from 'react'

import { cn } from '@/utils/styles'

interface SpinnerProps extends Omit<ComponentProps<typeof Loader2>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  decorative?: boolean
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

export const Spinner = ({
  size = 'md',
  label = 'Loading',
  decorative = false,
  className,
  ...props
}: SpinnerProps) => {
  const iconClasses = cn(
    'shrink-0 animate-spin text-current',
    sizeClasses[size],
    className,
  )

  if (decorative) {
    return (
      <Loader2
        data-slot="spinner"
        data-testid="spinner-icon"
        className={iconClasses}
        aria-hidden
        {...props}
      />
    )
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center justify-center"
    >
      <Loader2
        data-slot="spinner"
        data-testid="spinner-icon"
        className={iconClasses}
        aria-hidden
        {...props}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
