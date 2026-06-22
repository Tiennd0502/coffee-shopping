'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

import { LIST_QUERY_GC_MS, LIST_QUERY_STALE_MS } from '@/constants/common'

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: LIST_QUERY_STALE_MS,
            gcTime: LIST_QUERY_GC_MS,
            retry: 1,
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
