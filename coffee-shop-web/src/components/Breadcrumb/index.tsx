'use client'

import { Fragment } from 'react'

import {
  Breadcrumb as BasicBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'

export interface BreadcrumbNavItem {
  label: string
  href: string
}

export interface BreadcrumbProps {
  items: BreadcrumbNavItem[]
  className?: string
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const pathname = usePathname()
  if (items.length === 0) {
    return null
  }

  return (
    <BasicBreadcrumb className={className}>
      <BreadcrumbList>
        {items.map(({ href, label }, index) => {
          const isActive = href === pathname

          return (
            <Fragment key={`${href}-${label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isActive ? (
                  <BreadcrumbPage className="tracking-wide text-md font-bold text-primary ">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={href}
                    className="tracking-wide text-md font-bold text-muted-foreground"
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </BasicBreadcrumb>
  )
}

export default Breadcrumb
