'use client'

import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/styles'

export interface QuantityProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function Quantity({
  value,
  onChange,
  min = 1,
  max = Number.POSITIVE_INFINITY,
  disabled = false,
  className,
}: QuantityProps) {
  const nextDecrease = Math.max(min, value - 1)
  const nextIncrease = Math.min(max, value + 1)
  const disableDecrease = disabled || value <= min
  const disableIncrease = disabled || value >= max

  return (
    <div
      className={cn(
        'inline-flex h-13 items-center rounded-full border border-outline-variant/80 bg-surface-container-low/90 px-1 dark:bg-surface-container-high/80',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
      role="group"
      aria-label="Quantity controls"
      aria-disabled={disabled}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-10 rounded-full"
        aria-label="Decrease quantity"
        onClick={() => onChange(nextDecrease)}
        disabled={disableDecrease}
      >
        <Minus className="size-4" aria-hidden />
      </Button>
      <span
        className="min-w-10 text-center text-sm font-semibold text-on-surface tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-10 rounded-full"
        aria-label="Increase quantity"
        onClick={() => onChange(nextIncrease)}
        disabled={disableIncrease}
      >
        <Plus className="size-4" aria-hidden />
      </Button>
    </div>
  )
}
