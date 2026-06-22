import type { ComponentType, SVGProps } from 'react'

export interface MenuItem {
  label: string
  href: string
  match?: 'exact' | 'prefix'
  disabled?: boolean
}

export interface DashboardMenuItem extends MenuItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  match: 'exact' | 'prefix'
  disabled?: boolean
}
