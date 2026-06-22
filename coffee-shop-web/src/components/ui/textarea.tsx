import * as React from 'react'

import { cn } from '@/utils/styles'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'field-sizing-content min-h-36 w-full rounded-none border-0 bg-surface-container-high px-6 py-5 text-md leading-relaxed text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/80 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'
