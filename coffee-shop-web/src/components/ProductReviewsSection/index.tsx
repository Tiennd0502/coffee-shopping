'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { ProductReviewCard } from '@/components/ProductReviewCard'
import { Button } from '@/components/ui/button'
import {
  MOCK_PRODUCT_REVIEWS,
  COMMUNITY_KICKER,
  type ProductReviewDisplay,
} from '@/constants/product'
import { cn } from '@/utils/styles'

export interface ProductReviewsSectionProps {
  reviews?: ProductReviewDisplay[]
  className?: string
}

export function ProductReviewsSection({
  reviews = MOCK_PRODUCT_REVIEWS,
  className,
}: ProductReviewsSectionProps) {
  return (
    <section
      className={cn(
        'space-y-8 border-t border-primary/15 bg-transparent pt-14',
        className,
      )}
      aria-labelledby="customer-impressions-heading"
      data-testid="product-reviews-section"
    >
      <p className="text-center text-xs font-bold tracking-[0.3em] text-primary uppercase sm:text-left">
        {COMMUNITY_KICKER}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="customer-impressions-heading"
          className="text-center font-pdp text-3xl text-on-surface sm:text-left md:text-4xl"
        >
          Customer Impressions
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full shrink-0 border-primary/30 sm:w-auto"
          onClick={() =>
            toast.info(
              'Reviews are read-only until we launch community accounts.',
            )
          }
        >
          Write a Review
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {reviews.map((review) => (
          <li key={review.id}>
            <ProductReviewCard review={review} />
          </li>
        ))}
      </ul>

      <div className="flex justify-center pt-4">
        <Link
          href="/roasts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          aria-label="View more customer experiences on the roasts listing"
        >
          View More Experiences
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
