'use client'

import * as React from 'react'

import { cn } from '@/utils/styles'

export const Label = ({
  className,
  ...props
}: React.ComponentProps<'label'>) => {
  return (
    <label
      data-slot="label"
      className={cn(
        'mb-2 block text-sm font-semibold tracking-widest text-on-surface-variant select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
