import { PAGE_SIZE } from '@/constants/common'
import {
  ROAST_PRICE_MAX,
  ROAST_PRICE_MIN,
  ROAST_SORT_VALUE,
  type RoastSortValue,
} from '@/constants/roast'
import { ROAST_LEVEL } from '@/types/product'

const ROAST_LEVEL_SET = new Set<string>(Object.values(ROAST_LEVEL))

export function parseOptionalQueryParam(value: string | null): string | null {
  const v = value?.trim() ?? ''
  return v === '' ? null : v
}

export function parseListPageParam(value: string | null): number {
  const n = Number.parseInt(value ?? '1', 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

export function parseListSearchParam(value: string | null): string {
  return value ?? ''
}

export function parseListLimitParam(value: string | null): number {
  if (value == null || value === '') return PAGE_SIZE
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return PAGE_SIZE
  return n
}

export const urlSchema = {
  page: parseListPageParam,
  search: parseListSearchParam,
  limit: parseListLimitParam,
}

export const userUrlSchema = {
  ...urlSchema,
  role: parseOptionalQueryParam,
} as const

export const productUrlSchema = {
  ...urlSchema,
  categoryId: parseOptionalQueryParam,
  status: parseOptionalQueryParam,
} as const

export const ordersUrlSchema = {
  ...urlSchema,
  status: parseOptionalQueryParam,
  shippingStatus: parseOptionalQueryParam,
} as const

export function parseRoastPriceQueryParam(
  value: string | null,
  kind: 'min' | 'max',
): number {
  const fallback = kind === 'min' ? ROAST_PRICE_MIN : ROAST_PRICE_MAX
  if (value == null || value === '') return fallback
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(n, ROAST_PRICE_MIN), ROAST_PRICE_MAX)
}

export function parseRoastLevelsParam(value: string | null): ROAST_LEVEL[] {
  if (value == null || value.trim() === '') return []
  const parts = value.split(',').map((s) => s.trim().toUpperCase())
  const out: ROAST_LEVEL[] = []
  for (const part of parts) {
    if (ROAST_LEVEL_SET.has(part)) {
      out.push(part as ROAST_LEVEL)
    }
  }
  return out
}

export function parseRoastSortParam(value: string | null): RoastSortValue {
  const v = value?.trim() ?? ''
  if (
    v === ROAST_SORT_VALUE.CURATED ||
    v === ROAST_SORT_VALUE.PRICE_ASC ||
    v === ROAST_SORT_VALUE.PRICE_DESC ||
    v === ROAST_SORT_VALUE.NAME_ASC ||
    v === ROAST_SORT_VALUE.NAME_DESC
  ) {
    return v
  }
  return ROAST_SORT_VALUE.CURATED
}

/** Shop /roasts: list + filters in query string (real API + shareable state). */
export const shopRoastsUrlSchema = {
  page: parseListPageParam,
  limit: parseListLimitParam,
  search: parseListSearchParam,
  minPrice: (v: string | null) => parseRoastPriceQueryParam(v, 'min'),
  maxPrice: (v: string | null) => parseRoastPriceQueryParam(v, 'max'),
  roastLevel: parseRoastLevelsParam,
  sortBy: parseRoastSortParam,
} as const
