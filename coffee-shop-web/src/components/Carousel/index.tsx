'use client'

import {
  Carousel as CarouselRoot,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { CarouselApi } from '@/components/ui/carousel'
import { cn } from '@/utils/styles'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

const CAROUSEL_OPTS = { align: 'start' as const }

export interface CarouselProps<T> {
  items: readonly T[]
  renderItem: (item: T) => ReactNode
  renderDotItem?: (item: T) => ReactNode
  /** Root wrapper (column: main slide block, then optional thumbnails). */
  className?: string
  /** Main slide viewport + prev/next; use for aspect ratio, rounded corners, overflow clip. */
  slideAreaClassName?: string
  contentClassName?: string
  thumbnailRowClassName?: string
}

const Carousel = <T,>({
  className = '',
  slideAreaClassName = '',
  contentClassName = '',
  thumbnailRowClassName = '',
  items,
  renderItem,
  renderDotItem,
}: CarouselProps<T>) => {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    onSelect()
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  const scrollTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, items.length - 1))
      api?.scrollTo(next)
    },
    [api, items.length],
  )

  const hasMultipleSlides = items.length > 1

  return (
    <CarouselRoot
      className={cn('flex w-full flex-col', className)}
      setApi={setApi}
      opts={CAROUSEL_OPTS}
    >
      <div className={cn('relative w-full min-w-0', slideAreaClassName)}>
        <CarouselContent className={cn('ml-0', contentClassName)}>
          {items.map((item, index) => (
            <CarouselItem
              key={`carousel-item-${index}`}
              className="min-w-0 shrink-0 grow-0 basis-full pl-0 rounded-sm"
            >
              <div className="min-w-0 w-full rounded-sm">
                {renderItem(item)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {hasMultipleSlides && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </div>
      {renderDotItem && hasMultipleSlides && (
        <div
          className={cn(
            'mt-4 flex w-full shrink-0 justify-start gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            thumbnailRowClassName,
          )}
          role="tablist"
          aria-label="Carousel slides"
        >
          {items.map((item, index) => {
            const selected = index === selectedIndex
            return (
              <button
                key={`carousel-thumb-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Show slide ${index + 1} of ${items.length}`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'relative size-20 shrink-0 overflow-hidden rounded-sm border-2 transition-colors md:size-24',
                  selected
                    ? 'border-primary ring-2 ring-primary/25'
                    : 'border-transparent opacity-90 hover:opacity-100',
                )}
              >
                {renderDotItem(item)}
              </button>
            )
          })}
        </div>
      )}
    </CarouselRoot>
  )
}

export { Carousel }
export default Carousel
