import { X } from 'lucide-react'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utils/styles'

export interface BadgeActionProps extends Omit<
  ButtonProps,
  'children' | 'onClick' | 'variant' | 'size'
> {
  label: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  variant?: BadgeProps['variant']
  badgeClassName?: string
}

export const BadgeAction = ({
  className,
  label,
  variant = 'default',
  onClick,
  type = 'button',
  badgeClassName,
  ...props
}: BadgeActionProps) => {
  return (
    <Button
      variant="ghost"
      size="xs"
      className={cn(
        'h-8! w-fit! rounded-full p-0 shadow-none hover:bg-transparent',
        className,
      )}
      onClick={onClick}
      type={type}
      {...props}
    >
      <Badge
        variant={variant}
        className={cn(
          'pointer-events-none h-8! gap-2 px-3 text-sm font-semibold',
          badgeClassName,
        )}
      >
        <span>{label}</span>
        <X className="size-4" aria-hidden data-slot="badge-action-icon" />
      </Badge>
    </Button>
  )
}
