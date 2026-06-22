import { type OptionItem } from '@/types/common'
import { ROAST_LEVEL } from '@/types/product'

export const ROAST_PRICE_MIN = 5
export const ROAST_PRICE_MAX = 250
export const ROAST_DEFAULT_PRICE_RANGE: [number, number] = [
  ROAST_PRICE_MIN,
  ROAST_PRICE_MAX,
]

export const ROAST_SORT_VALUE = {
  CURATED: 'curated',
  PRICE_ASC: 'PRICE_ASC',
  PRICE_DESC: 'PRICE_DESC',
  NAME_ASC: 'NAME_ASC',
  NAME_DESC: 'NAME_DESC',
} as const

export type RoastSortValue =
  (typeof ROAST_SORT_VALUE)[keyof typeof ROAST_SORT_VALUE]

export interface RoastLevelOption {
  value: ROAST_LEVEL
  label: string
}

export const ROAST_LEVEL_OPTIONS: RoastLevelOption[] = [
  { value: ROAST_LEVEL.LIGHT, label: 'Light Roast' },
  { value: ROAST_LEVEL.MEDIUM, label: 'Medium Roast' },
  { value: ROAST_LEVEL.DARK, label: 'Dark Roast' },
]

export const ROAST_LEVEL_SPECTRUM_PERCENT: Record<ROAST_LEVEL, number> = {
  [ROAST_LEVEL.LIGHT]: 15,
  [ROAST_LEVEL.MEDIUM]: 50,
  [ROAST_LEVEL.DARK]: 85,
}

export const ROAST_SORT_OPTIONS: OptionItem[] = [
  { value: ROAST_SORT_VALUE.CURATED, label: 'Curated Selection' },
  { value: ROAST_SORT_VALUE.PRICE_ASC, label: 'Price: Low to High' },
  { value: ROAST_SORT_VALUE.PRICE_DESC, label: 'Price: High to Low' },
  { value: ROAST_SORT_VALUE.NAME_ASC, label: 'Name: A to Z' },
  { value: ROAST_SORT_VALUE.NAME_DESC, label: 'Name: Z to A' },
]

export interface RoastCollection {
  id: string
  name: string
  price: number
  flavorNotes: string
  roastMeta: string
  roastLevel: ROAST_LEVEL
  imageUrl: string
  badgeLabel?: string
}
