'use client'

import { ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CartTotals } from '@/types/cart'
import { formatCurrency } from '@/utils/cart'
import { cn } from '@/utils/styles'

export interface CartSummaryCardProps {
  totals: CartTotals
  onCheckout: () => void
  onContinueShopping: () => void
  isCheckoutDisabled?: boolean
  className?: string
}

export function CartSummaryCard({
  totals,
  onCheckout,
  onContinueShopping,
  isCheckoutDisabled = false,
  className,
}: CartSummaryCardProps) {
  return (
    <aside
      className={cn(
        'rounded-3xl border border-outline-variant/70 bg-surface-container-low p-6 shadow-sm md:p-8',
        className,
      )}
    >
      <h2 className="text-xl">Order Summary</h2>
      <div className="my-6 h-px bg-outline-variant/60" />

      <dl className="space-y-3 text-md">
        <div className="flex items-center justify-between gap-3">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(totals.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Shipping</dt>
          <dd>
            {totals.shipping === null
              ? 'Calculated at checkout'
              : formatCurrency(totals.shipping)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Tax</dt>
          <dd>{formatCurrency(totals.tax)}</dd>
        </div>
      </dl>

      <div className="my-6 h-px bg-outline-variant/60" />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xl font-bold text-on-surface">Order Total</p>
        <p className="text-xl font-bold text-primary">
          {formatCurrency(totals.total)}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          type="button"
          className="h-14 rounded-full text-base"
          onClick={onCheckout}
          disabled={isCheckoutDisabled}
        >
          Proceed to Checkout
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-auto text-base text-primary"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </Button>
      </div>

      <div className="mt-8 flex items-start align-center gap-3 border-t border-outline-variant/60 pt-6 text-sm text-on-surface-variant">
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden
        />
        <p>
          Secure checkout powered by Node Pay. Your sensory data is always
          protected.
        </p>
      </div>
    </aside>
  )
}
