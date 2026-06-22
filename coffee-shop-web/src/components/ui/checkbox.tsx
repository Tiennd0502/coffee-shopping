'use client'

import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { cn } from '@/utils/styles'

export type CheckboxProps = CheckboxPrimitive.Root.Props & {
  label?: React.ReactNode
  labelClassName?: string
  wrapperClassName?: string
}

export const Checkbox = ({
  label,
  labelClassName,
  wrapperClassName,
  className,
  ...rootProps
}: CheckboxProps) => {
  const generatedId = React.useId()

  return (
    <div
      className={cn('flex items-center gap-2', wrapperClassName)}
      data-slot="checkbox-field"
    >
      <CheckboxPrimitive.Root
        id={generatedId}
        data-slot="checkbox"
        className={cn(
          'peer inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-transparent outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-unchecked:border-outline-variant data-unchecked:bg-card data-checked:border-primary data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:data-unchecked:border-border',
          className,
        )}
        {...rootProps}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-primary-foreground"
        >
          <Check className="size-3" strokeWidth={3} aria-hidden />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {Boolean(label) && (
        <Label
          htmlFor={generatedId}
          className={cn(
            'mb-0 inline cursor-pointer font-medium tracking-normal text-foreground peer-disabled:cursor-not-allowed',
            labelClassName,
          )}
        >
          {label}
        </Label>
      )}
    </div>
  )
}
