import { Star } from 'lucide-react'

import {
  PLACEHOLDER_RATING,
  PLACEHOLDER_REVIEW_COUNT,
} from '@/constants/product'
import { cn } from '@/utils/styles'

export interface ProductDetailRatingRowProps {
  className?: string
}

export function ProductDetailRatingRow({
  className,
}: ProductDetailRatingRowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-on-surface-variant',
        className,
      )}
      data-testid="product-detail-rating-row"
    >
      <Star className="size-5 shrink-0 fill-primary text-primary" aria-hidden />
      <span className="text-sm">
        {PLACEHOLDER_RATING.toFixed(1)} ({PLACEHOLDER_REVIEW_COUNT} reviews)
      </span>
    </div>
  )
}
