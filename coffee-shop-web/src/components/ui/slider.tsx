import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { cn } from '@/utils/styles'

const getThumbValues = (
  value: number | readonly number[] | undefined,
  defaultValue: number | readonly number[] | undefined,
  min: number,
  max: number,
): number[] => {
  if (value !== undefined) {
    if (typeof value === 'number') {
      return [value]
    }
    return [...value]
  }
  if (defaultValue !== undefined) {
    if (typeof defaultValue === 'number') {
      return [defaultValue]
    }
    return [...defaultValue]
  }
  return [min, max]
}

export const Slider = ({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) => {
  const thumbValues = getThumbValues(value, defaultValue, min, max)

  return (
    <SliderPrimitive.Root
      className={cn('data-horizontal:w-full data-vertical:h-full', className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none select-none items-center data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-border select-none data-horizontal:h-2 data-horizontal:w-full data-vertical:h-full data-vertical:w-2"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbValues.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              'relative box-border block size-4 shrink-0 rounded-full border-2 border-background',
              'bg-ring shadow-none dark:bg-muted-background',
              'outline-none transition-[border-color,box-shadow] select-none',
              'after:absolute after:-inset-2 after:content-[""]',
              'focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:outline-hidden',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
