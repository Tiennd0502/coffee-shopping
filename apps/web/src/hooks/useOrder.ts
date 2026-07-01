'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
import {
  type QueryParams,
  type PaginatedResponse,
  type ResponseSuccess,
  type ORDER_STATUS,
  type SHIPPING_STATUS,
} from '@repo/types';
import type { Order, OrderPayload } from '@/types/order';

// Constants
import { LIST_QUERY_GC_MS, LIST_QUERY_STALE_MS, PAGE_SIZE } from '@/constants/common';
import { API_ROUTES } from '@/constants/routes';

// Services
import { apiClient } from '@/services/api';

interface OrdersQueryParams extends QueryParams {
  status?: string;
  shippingStatus?: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ body }: { body: OrderPayload }) =>
      apiClient.post<ResponseSuccess<Order>>(API_ROUTES.ORDERS, body),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`${API_ROUTES.ORDERS}/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ORDER_STATUS }) =>
      apiClient.patch<ResponseSuccess<Order>>(`${API_ROUTES.ORDERS}/${id}/status`, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderShippingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, shippingStatus }: { id: string; shippingStatus: SHIPPING_STATUS }) =>
      apiClient.patch<ResponseSuccess<Order>>(`${API_ROUTES.ORDERS}/${id}/shipping-status`, {
        shippingStatus,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrders(params: OrdersQueryParams) {
  const { page, limit, search, status, shippingStatus } = params;

  return useQuery({
    queryKey: [
      'orders',
      'list',
      page ?? 1,
      limit ?? PAGE_SIZE,
      search ?? '',
      status ?? '',
      shippingStatus ?? '',
    ],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Order[]>>(API_ROUTES.ORDERS, {
        query: {
          page,
          limit,
          search,
          status,
          shippingStatus,
        },
      }),
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  });
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => apiClient.get<ResponseSuccess<Order>>(`${API_ROUTES.ORDERS}/${id}`),
    enabled: Boolean(id),
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  });
}
