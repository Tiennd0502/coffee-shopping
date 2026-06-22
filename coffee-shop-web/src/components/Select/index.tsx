'use client'

import * as React from 'react'

import { Label } from '@/components/ui/label'
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/styles'
import { type OptionItem } from '@/types/common'

export interface SelectProps extends Omit<
  React.ComponentProps<typeof SelectRoot>,
  'children' | 'id' | 'value' | 'defaultValue'
> {
  errorMessage?: string
  label?: React.ReactNode
  placeholder?: string
  selected?: string | number
  options: OptionItem[]
  classNameTrigger?: string
}

export const Select = ({
  label,
  placeholder = '',
  selected,
  options,
  disabled = false,
  onValueChange,
  errorMessage,
  classNameTrigger = '',
  ...rootProps
}: SelectProps) => {
  const controlId = React.useId()
  const selectedValue =
    selected === undefined || selected === null ? '' : String(selected)
  const [internalSelected, setInternalSelected] = React.useState(selectedValue)

  React.useEffect(() => {
    setInternalSelected(selectedValue)
  }, [selectedValue])

  const handleValueChange = React.useCallback(
    (value: unknown, eventDetails: unknown) => {
      const nextSelected =
        typeof value === 'string' || typeof value === 'number'
          ? String(value)
          : ''
      setInternalSelected(nextSelected)
      onValueChange?.(value, eventDetails as never)
    },
    [onValueChange],
  )

  const selectedLabel =
    internalSelected === ''
      ? undefined
      : options.find((option) => String(option.value) === internalSelected)
          ?.label

  return (
    <div className="w-full">
      {Boolean(label) && <Label htmlFor={controlId}>{label}</Label>}
      <SelectRoot
        value={internalSelected}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...rootProps}
      >
        <SelectTrigger
          id={controlId}
          className={cn(
            'w-full',
            classNameTrigger,
            Boolean(errorMessage) ? 'border border-destructive' : undefined,
          )}
          disabled={disabled}
        >
          <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={String(item.value)} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {Boolean(errorMessage) && (
        <p className="mt-2 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
