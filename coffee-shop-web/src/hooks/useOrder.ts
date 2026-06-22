'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  LIST_QUERY_GC_MS,
  LIST_QUERY_STALE_MS,
  PAGE_SIZE,
} from '@/constants/common'
import {
  createOrder,
  deleteOrder,
  fetchOrders,
  updateOrderShippingStatus,
  updateOrderStatus,
  type FetchOrdersOptions,
} from '@/services/order'
import type { ResponseMeta } from '@/types/api'
import type {
  Order,
  OrderPayload,
  ORDER_STATUS,
  SHIPPING_STATUS,
} from '@/types/order'

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (input: {
      body: OrderPayload
      getToken?: () => Promise<string | null>
    }): Promise<Order> => {
      const result = await createOrder(input.body, { getToken: input.getToken })
      if (!result.ok) {
        throw Object.assign(new Error(result.error.message), {
          response: { data: result.error },
        })
      }
      return result.order
    },
  })
}

const ordersQueryRoot = ['orders'] as const

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteOrder(id)
      if (!result.ok) throw new Error(result.error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryRoot })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; status: ORDER_STATUS }) => {
      const result = await updateOrderStatus(input.id, input.status)
      if (!result.ok) throw new Error(result.error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryRoot })
    },
  })
}

export function useUpdateOrderShippingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      id: string
      shippingStatus: SHIPPING_STATUS
    }) => {
      const result = await updateOrderShippingStatus(
        input.id,
        input.shippingStatus,
      )
      if (!result.ok) throw new Error(result.error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryRoot })
    },
  })
}

export type UseOrdersParams = FetchOrdersOptions

export interface UseOrdersResult {
  orders: Order[]
  meta: ResponseMeta | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function ordersListQueryKey(params: FetchOrdersOptions) {
  return [
    'orders',
    'list',
    params.page ?? 1,
    params.limit ?? PAGE_SIZE,
    params.search ?? '',
    params.status ?? '',
    params.shippingStatus ?? '',
  ] as const
}

export function useOrders(params: UseOrdersParams = {}): UseOrdersResult {
  const query = useQuery({
    queryKey: ordersListQueryKey(params),
    queryFn: async () => {
      const result = await fetchOrders(params)
      if (!result.ok) throw new Error(result.error.message)
      return {
        orders: result.orders,
        meta: result.meta ?? null,
      }
    },
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  })

  return {
    orders: query.data?.orders ?? [],
    meta: query.data?.meta ?? null,
    isLoading: !query.data && query.isFetching,
    isError: query.isError,
    errorMessage:
      query.isError && query.error instanceof Error
        ? query.error.message
        : query.isError
          ? String(query.error)
          : null,
    refetch: async () => {
      await query.refetch()
    },
  }
}
