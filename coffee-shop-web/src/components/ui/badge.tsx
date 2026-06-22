import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/styles'

const badgeVariants = cva(
  'inline-flex h-6 w-fit items-center rounded-full border px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-on-primary',
        secondary:
          'border-transparent bg-surface-container-high text-on-surface-variant',
        outline:
          'border-outline-variant bg-surface-container-low text-on-surface-variant',
        destructive: 'border-transparent bg-destructive text-on-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: BadgeProps) => {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
