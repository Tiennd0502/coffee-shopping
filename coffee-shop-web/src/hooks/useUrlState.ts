'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Parser<T> = (value: string | null) => T
type Schema = Record<string, Parser<any>>

export function useUrlState<T extends Schema>(schema: T) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const state = useMemo(() => {
    const result: any = {}

    for (const key in schema) {
      result[key] = schema[key](sp.get(key))
    }

    return result as {
      [K in keyof T]: ReturnType<T[K]>
    }
  }, [sp, schema])

  const update = useCallback(
    (patch: Partial<Record<keyof T, any>>) => {
      const next = new URLSearchParams(sp.toString())

      for (const key in patch) {
        const value = patch[key]

        if (value === null || value === undefined || value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }

      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, sp],
  )

  return { state, update }
}
