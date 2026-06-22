'use client'

import * as React from 'react'
import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'

import { cn } from '@/utils/styles'

const separatorTrackClasses =
  'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch'

type SeparatorPrimitiveProps = React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive
>

export type SeparatorProps = SeparatorPrimitiveProps & {
  /** Center label on the line; blank after trim → standard separator. Vertical uses rotated text. */
  text?: string
  textClassName?: string
}

export const Separator = ({
  className,
  orientation = 'horizontal',
  text = '',
  textClassName,
  ...props
}: SeparatorProps) => {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={cn(
        'relative',
        isHorizontal
          ? 'w-full py-2'
          : 'inline-flex h-full min-h-20 w-auto flex-col items-stretch px-2',
        className,
      )}
      data-slot="separator"
      {...props}
    >
      <SeparatorPrimitive
        orientation={orientation}
        aria-label={text}
        className={cn(
          separatorTrackClasses,
          isHorizontal ? 'w-full' : 'min-h-0 flex-1 basis-0',
        )}
      />
      {Boolean(text) && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground',
            !isHorizontal && 'origin-center -rotate-90 whitespace-nowrap',
            textClassName,
          )}
        >
          {text}
        </span>
      )}
    </div>
  )
}
