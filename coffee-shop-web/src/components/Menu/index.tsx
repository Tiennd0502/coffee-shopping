'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { type MenuItem } from '@/types/menu'
import { cn } from '@/utils/styles'

const desktopNavLinkClass = (active: boolean) =>
  cn(
    'relative whitespace-nowrap pb-1 text-sm font-medium transition-colors px-2.5 py-4',
    active
      ? 'font-semibold pb-1.5 mb-2 text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
      : 'text-muted-foreground hover:text-foreground',
  )

const disabledDesktopNavClass = cn(
  'relative whitespace-nowrap pb-1 text-sm font-medium px-2.5 py-4',
  'cursor-not-allowed text-muted-foreground/60',
)

const renderDesktopNavLink = (item: MenuItem, isActive: boolean) => {
  if (item.disabled) {
    return (
      <span
        key={item.href + item.label}
        className={disabledDesktopNavClass}
        aria-disabled="true"
        tabIndex={-1}
      >
        {item.label}
      </span>
    )
  }

  return (
    <Link
      key={item.href + item.label}
      href={item.href}
      className={desktopNavLinkClass(isActive)}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </Link>
  )
}

export interface DesktopMainNavProps {
  className?: string
  items: MenuItem[]
}

export const Menu = ({ className, items }: DesktopMainNavProps) => {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'ml-auto mr-auto hidden items-center gap-8 lg:flex',
        className,
      )}
      aria-label="Primary"
    >
      {items.map((item) => {
        const isActive =
          !item.disabled &&
          (item.match === 'exact'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`))

        return renderDesktopNavLink(item, isActive)
      })}
    </nav>
  )
}
