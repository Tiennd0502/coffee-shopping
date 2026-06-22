import Image from 'next/image'
import { Star } from 'lucide-react'

import { DEFAULT_AVATAR } from '@/constants/images'
import type { ProductReviewDisplay } from '@/constants/product'
import { cn } from '@/utils/styles'

export interface ProductReviewCardProps {
  review: ProductReviewDisplay
  className?: string
}

export function ProductReviewCard({
  review,
  className,
}: ProductReviewCardProps) {
  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-primary/10 bg-surface-container-low p-5 shadow-sm dark:border-border',
        className,
      )}
    >
      <div className="flex gap-4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-primary/10 bg-surface-container-high">
          <Image
            src={DEFAULT_AVATAR}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-on-surface">
                {review.authorName}
              </p>
              <p className="text-xs text-on-surface-variant">
                {review.authorRole}
              </p>
            </div>
          </div>
          <StarRow rating={review.rating} />
          <blockquote className="text-sm leading-relaxed text-on-surface">
            &ldquo;{review.quote}&rdquo;
          </blockquote>
        </div>
      </div>
      <time
        className="mt-4 text-xs text-on-surface-variant"
        dateTime={review.dateLabel}
      >
        {review.dateLabel}
      </time>
    </article>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'size-4 shrink-0',
            i < rating
              ? 'fill-primary-container text-primary-container'
              : 'text-outline-variant',
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}
