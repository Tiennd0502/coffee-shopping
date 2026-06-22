import { type LucideIcon } from 'lucide-react'

import { cn } from '@/utils/styles'

export interface StatCardItem {
  id: string
  label: string
  value: string | number
  footnote?: string
  variant?: 'default' | 'accent'
  icon?: LucideIcon
  footnoteIcon?: LucideIcon
  footnoteTone?: 'muted' | 'success'
}

export interface StatsCardsProps {
  items: StatCardItem[]
  className?: string
}

export const StatCard = ({ item }: { item: StatCardItem }) => {
  const {
    label,
    value,
    footnote,
    variant = 'default',
    icon: WatermarkIcon,
    footnoteIcon: FootnoteIcon,
    footnoteTone = 'muted',
  } = item
  const isAccent = variant === 'accent'

  return (
    <article
      data-slot="stats-card"
      className={cn(
        'relative overflow-hidden rounded-3xl border p-6',
        'flex min-h-44 flex-col justify-between',
        isAccent
          ? 'border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/20'
          : 'border-outline-variant/35 bg-surface-container-high text-on-surface',
      )}
    >
      {isAccent && WatermarkIcon && (
        <WatermarkIcon
          aria-hidden
          className="pointer-events-none absolute -right-4 -bottom-4 size-28 text-primary-foreground/10"
        />
      )}
      <div className="space-y-3">
        <p
          className={cn(
            'text-sm font-semibold tracking-[0.18em] uppercase',
            isAccent
              ? 'text-primary-foreground/70'
              : 'text-on-surface-variant/80',
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            'text-5xl leading-none font-bold tabular-nums',
            isAccent ? 'text-primary-foreground' : 'text-on-surface',
          )}
        >
          {value}
        </p>
      </div>
      {footnote && (
        <p
          className={cn(
            'mt-4 inline-flex items-center gap-2 text-sm',
            footnoteTone === 'success' &&
              !isAccent &&
              'font-semibold text-emerald-700 dark:text-emerald-400',
            footnoteTone === 'muted' &&
              (isAccent
                ? 'text-primary-foreground/85'
                : 'text-on-surface-variant/80'),
          )}
        >
          {FootnoteIcon && <FootnoteIcon aria-hidden className="size-4" />}
          <span>{footnote}</span>
        </p>
      )}
    </article>
  )
}

export function StatsCards({ items, className }: StatsCardsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      data-slot="stats-cards"
      className={cn(
        'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <StatCard key={item.id} item={item} />
      ))}
    </section>
  )
}

export default StatsCards
