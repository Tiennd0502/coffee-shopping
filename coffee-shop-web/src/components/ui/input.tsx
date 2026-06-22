import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/utils/styles'

export const Input = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof InputPrimitive>
>(({ className, type, ...props }, ref) => {
  return (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'min-h-14 w-full min-w-0 rounded-xs border border-outline-variant/70 bg-surface-container-high px-6 py-4 text-md leading-normal text-on-surface outline-none transition-[background-color,border-color,box-shadow,color] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-on-surface-variant/80 focus-visible:border-ring focus-visible:bg-surface-container-highest focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant/80 disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/40 [&:-webkit-autofill]:[-webkit-text-fill-color:var(--on-surface)] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_var(--surface-container-high)_inset] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_var(--surface-container-high)_inset] [&:-webkit-autofill:focus]:[box-shadow:0_0_0_1000px_var(--surface-container-highest)_inset] [&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0_1000px_var(--surface-container-highest)_inset] [&:-webkit-autofill:focus-visible]:[box-shadow:0_0_0_1000px_var(--surface-container-highest)_inset] [&:-webkit-autofill:focus-visible]:[-webkit-box-shadow:0_0_0_1000px_var(--surface-container-highest)_inset]',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'
