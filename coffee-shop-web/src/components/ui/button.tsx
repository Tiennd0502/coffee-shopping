import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/utils/styles'

const buttonVariants = cva(
  "w-full group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent bg-clip-padding text-md font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,opacity,box-shadow] duration-200 ease-out focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'gap-2 border-transparent bg-gradient-to-r from-primary to-ring font-bold text-on-primary shadow-md shadow-primary/15 duration-300 ease-out hover:shadow-primary/25 focus-visible:border-ring focus-visible:ring-ring/50 hover:from-primary hover:to-ring active:opacity-80 dark:text-foreground dark:shadow-primary/20',
        outline:
          'border border-outline-variant bg-surface-container-low font-semibold text-primary shadow-none hover:bg-surface-container hover:text-primary aria-expanded:bg-surface-container dark:border-border dark:bg-surface-container dark:text-primary dark:hover:bg-surface-container-high',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'bg-transparent font-semibold text-primary shadow-none hover:bg-transparent hover:opacity-90 aria-expanded:bg-muted/50 dark:text-primary',
        destructive:
          'border-transparent bg-destructive font-bold text-on-error shadow-md shadow-destructive/25 hover:bg-destructive/90 hover:shadow-destructive/35 focus-visible:border-destructive focus-visible:ring-destructive/30 dark:shadow-destructive/20',
        link: 'rounded-md border-transparent bg-transparent font-semibold text-foreground shadow-none underline-offset-4 hover:opacity-90 hover:underline',
      },
      size: {
        default:
          "h-14 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-10 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-12 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-16 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-4",
        xl: "h-18 gap-2.5 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-4",
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        'icon-lg': "size-12 [&_svg:not([class*='size-'])]:size-4",
        'icon-xl': "size-14 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

export const Button = ({
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) => {
  const isDisabled = Boolean(disabled) || loading

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'opacity-100 cursor-pointer',
        className,
      )}
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
    >
      {loading ? (
        <>
          <Loader2
            className="size-4 shrink-0 animate-spin text-current"
            data-icon="inline-start"
            aria-hidden
          />
          {children}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export { buttonVariants }
