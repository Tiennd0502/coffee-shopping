'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
import type { Category, CategoryPayload } from '@/types/category';
import type { QueryParams, PaginatedResponse, ResponsSuccess } from '@repo/types';

// Constants
import { LIST_QUERY_GC_MS, LIST_QUERY_STALE_MS, PAGE_SIZE } from '@/constants/common';
import { API_ROUTES } from '@/constants/routes';

// Services
import { apiClient } from '@/services/api';

export const useCategories = (params: QueryParams) => {
  const { page, limit, search } = params;
  return useQuery({
    queryKey: ['categories', 'list', page ?? 1, limit ?? PAGE_SIZE, search ?? ''],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Category[]>>(API_ROUTES.CATEGORIES, {
        query: { page, limit, search: search?.trim() },
      }),
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  });
};

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) =>
      apiClient.post<ResponsSuccess<Category>>(API_ROUTES.CATEGORIES, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`${API_ROUTES.CATEGORIES}/${id}`),
    onSuccess: async (_result, deletedId) => {
      queryClient.setQueriesData<PaginatedResponse<Category[]>>(
        { queryKey: ['categories', 'list'] },
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
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export const useCategoryById = (id: string) =>
  useQuery({
    queryKey: ['categories', 'detail', id],
    queryFn: () => apiClient.get<ResponsSuccess<Category>>(`${API_ROUTES.CATEGORIES}/${id}`),
    enabled: Boolean(id?.trim()),
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
  });

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryPayload }) =>
      apiClient.patch<ResponsSuccess<Category>>(`${API_ROUTES.CATEGORIES}/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
