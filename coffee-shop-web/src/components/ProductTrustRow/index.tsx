import type { LucideIcon } from 'lucide-react'
import { Leaf, ShieldCheck, Truck } from 'lucide-react'

import { SHOP_PDP_TRUST_ITEMS } from '@/constants/product'
import { cn } from '@/utils/styles'

const ICONS: Record<(typeof SHOP_PDP_TRUST_ITEMS)[number]['id'], LucideIcon> = {
  ship: Truck,
  ethics: Leaf,
  quality: ShieldCheck,
}

export interface ProductTrustRowProps {
  className?: string
}

export function ProductTrustRow({ className }: ProductTrustRowProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-6 border-t border-primary/15 pt-8 sm:grid-cols-3',
        className,
      )}
      data-testid="product-trust-row"
    >
      {SHOP_PDP_TRUST_ITEMS.map((item) => {
        const Icon = ICONS[item.id]
        return (
          <li
            key={item.id}
            className="flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center"
          >
            <Icon className="size-7 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-on-surface">
              {item.title}
            </p>
            <p className="text-xs text-on-surface-variant">
              {item.description}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
