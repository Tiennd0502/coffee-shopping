'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  formatNumericWithThousands,
  normalizeNumericInput,
} from '@/utils/number'
import { cn } from '@/utils/styles'

export interface InputProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  'type'
> {
  id?: string
  label?: React.ReactNode
  text?: React.ReactNode
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  type?: React.HTMLInputTypeAttribute
  wrapperClassName?: string
  errorMessage?: React.ReactNode
}

const togglePasswordButtonClassName =
  'inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'

const InputField = React.forwardRef<HTMLElement, InputProps>(
  function InputField(
    {
      id: idProp,
      label,
      text,
      startIcon,
      endIcon,
      type = 'text',
      className,
      wrapperClassName,
      disabled,
      autoComplete,
      'aria-describedby': ariaDescribedByProp,
      'aria-invalid': ariaInvalidProp,
      errorMessage,
      onChange,
      value,
      defaultValue,
      ...rest
    },
    ref,
  ) {
    const reactId = React.useId()
    const baseId = idProp ?? reactId
    const inputId = `${baseId}-control`
    const descriptionId = `${inputId}-description`
    const errorId = `${inputId}-error`

    const isPassword = type === 'password'
    const isNumberType = type === 'number'
    const isControlledNumberInput = isNumberType && value !== undefined
    const [showPassword, setShowPassword] = React.useState(false)
    const [uncontrolledFormattedNumber, setUncontrolledFormattedNumber] =
      React.useState(() => {
        if (!isNumberType) return ''
        const normalized = normalizeNumericInput(String(defaultValue ?? ''))
        return formatNumericWithThousands(normalized)
      })

    React.useEffect(() => {
      if (!isPassword) {
        setShowPassword(false)
      }
    }, [isPassword])

    const effectiveType = isNumberType
      ? 'text'
      : isPassword && showPassword
        ? 'text'
        : (type ?? 'text')
    const effectiveNumberValue = isNumberType
      ? isControlledNumberInput
        ? formatNumericWithThousands(normalizeNumericInput(String(value ?? '')))
        : uncontrolledFormattedNumber
      : undefined

    const handleTogglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    const handleToggleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
    ) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleTogglePasswordVisibility()
      }
    }

    const handleNumberInputChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const normalized = normalizeNumericInput(event.target.value)
      const formatted = formatNumericWithThousands(normalized)

      if (!isControlledNumberInput) {
        setUncontrolledFormattedNumber(formatted)
      }

      if (!onChange) return
      ;(event.target as HTMLInputElement).value = normalized
      ;(event.currentTarget as HTMLInputElement).value = normalized
      onChange(
        event as React.ChangeEvent<HTMLInputElement> & {
          preventBaseUIHandler: () => void
        },
      )
    }

    const hasStartIcon = Boolean(startIcon)
    const hasEndIcon = Boolean(endIcon)
    const hasHelperText = Boolean(text)
    const hasError = Boolean(errorMessage)
    const hasTrailingSlot = hasEndIcon || isPassword

    const describedBy =
      [
        ariaDescribedByProp,
        hasHelperText ? descriptionId : undefined,
        hasError ? errorId : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined

    const isInvalidFromProp =
      ariaInvalidProp === true || ariaInvalidProp === 'true'
    const ariaInvalid = hasError || isInvalidFromProp ? true : ariaInvalidProp

    const padEndClass = !hasTrailingSlot
      ? null
      : hasEndIcon && isPassword
        ? 'pr-20'
        : 'pr-12'

    return (
      <div
        className={cn('group flex flex-col', wrapperClassName)}
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={hasError ? 'true' : undefined}
        data-slot="shared-input"
      >
        {Boolean(label) && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          {hasStartIcon && (
            <span
              className="pointer-events-none absolute top-1/2 left-4 z-10 flex -translate-y-1/2 text-on-surface-variant [&_svg]:size-5"
              aria-hidden
            >
              {startIcon}
            </span>
          )}
          <Input
            {...rest}
            ref={ref}
            id={inputId}
            type={effectiveType}
            disabled={disabled}
            inputMode={isNumberType ? 'decimal' : rest.inputMode}
            autoComplete={
              autoComplete ?? (isPassword ? 'current-password' : undefined)
            }
            value={isNumberType ? effectiveNumberValue : value}
            defaultValue={isNumberType ? undefined : defaultValue}
            onChange={isNumberType ? handleNumberInputChange : onChange}
            className={cn(
              'peer',
              hasStartIcon && 'pl-12',
              padEndClass,
              className,
            )}
            aria-describedby={describedBy}
            aria-invalid={ariaInvalid}
          />
          {hasTrailingSlot && (
            <div className="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center gap-1">
              {hasEndIcon && (
                <span className="flex text-on-surface-variant [&_svg]:size-5">
                  {endIcon}
                </span>
              )}
              {isPassword && (
                <button
                  type="button"
                  className={togglePasswordButtonClassName}
                  onClick={handleTogglePasswordVisibility}
                  onKeyDown={handleToggleKeyDown}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  tabIndex={0}
                  disabled={disabled}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" aria-hidden />
                  ) : (
                    <Eye className="size-5" aria-hidden />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        {hasHelperText && (
          <p
            id={descriptionId}
            className="mt-2 text-xs text-on-surface-variant"
          >
            {text}
          </p>
        )}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-xs font-medium text-destructive"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  },
)

export { InputField as Input }
