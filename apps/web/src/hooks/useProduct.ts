'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
import { type QueryParams, type PaginatedResponse, type ResponsSuccess } from '@repo/types';
import type { Product, ProductPayload, ProductUpdatePayload } from '@/types/product';

// Constants
import { LIST_QUERY_GC_MS, LIST_QUERY_STALE_MS, PAGE_SIZE } from '@/constants/common';
import { API_ROUTES } from '@/constants/routes';

// Services
import { apiClient } from '@/services/api';

export interface ProductQueryParams extends QueryParams {
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  roastLevel?: string;
  sortBy?: string;
}

export const useProducts = (params: ProductQueryParams) => {
  const { page, limit, search, categoryId, status, minPrice, maxPrice, roastLevel, sortBy } =
    params;

  return useQuery({
    queryKey: [
      'products',
      'list',
      page ?? 1,
      limit ?? PAGE_SIZE,
      search ?? '',
      categoryId ?? '',
      status ?? '',
      minPrice ?? '',
      maxPrice ?? '',
      roastLevel ?? '',
      sortBy ?? '',
    ],
    queryFn: () => {
      return apiClient.get<PaginatedResponse<Product[]>>(API_ROUTES.PRODUCTS, {
        query: {
          page,
          limit,
          search: search?.trim(),
          categoryId: categoryId?.trim(),
          status: status?.trim(),
          minPrice,
          maxPrice,
          roastLevel: roastLevel?.trim(),
          sortBy: sortBy?.trim(),
        },
      });
    },
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  });
};

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: ProductPayload) =>
      apiClient.post<ResponsSuccess<Product>>(API_ROUTES.PRODUCTS, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`${API_ROUTES.PRODUCTS}/${id}`),
    onSuccess: async (_result, deletedId) => {
      queryClient.setQueriesData<PaginatedResponse<Product[]>>(
        { queryKey: ['products', 'list'] },
        (old) => {
          if (!old) return old;

          const data = old.data.filter((c) => c.id !== deletedId);
          if (data.length === old.data.length) return old;

          return {
            ...old,
            data,
            meta: {
              ...old.meta,
              totalCount: Math.max(0, old.meta.totalCount - 1),
            },
          };
        },
      );
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => apiClient.get<ResponsSuccess<Product>>(`${API_ROUTES.PRODUCTS}/${id}`),
    enabled: Boolean(id?.trim()),
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: ProductUpdatePayload }) =>
      apiClient.patch<ResponsSuccess<Product>>(`${API_ROUTES.PRODUCTS}/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
