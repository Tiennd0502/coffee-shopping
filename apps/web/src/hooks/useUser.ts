'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
import type { PaginatedResponse, QueryParams, ResponseSuccess, User, USER_ROLE } from '@repo/types';

// Constants
import { LIST_QUERY_GC_MS, LIST_QUERY_STALE_MS, PAGE_SIZE } from '@/constants/common';
import { API_ROUTES } from '@/constants/routes';

// Services
import { apiClient } from '@/services/api';

export interface UsersQueryParams extends QueryParams {
  role?: string;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: USER_ROLE }) =>
      apiClient.patch<ResponseSuccess<User>>(`${API_ROUTES.USERS}/${id}`, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      apiClient.delete(`${API_ROUTES.USERS}/${encodeURIComponent(id)}`),
    onSuccess: async (_result, deletedId) => {
      queryClient.setQueriesData<PaginatedResponse<User[]>>(
        { queryKey: ['users', 'list', deletedId] },
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

export const useUsers = (params: UsersQueryParams) => {
  const { page, limit, search, role } = params;
  return useQuery({
    queryKey: ['users', 'list', page ?? 1, limit ?? PAGE_SIZE, search ?? '', role ?? ''],
    queryFn: () =>
      apiClient.get<PaginatedResponse<User[]>>(API_ROUTES.USERS, {
        query: {
          page,
          limit,
          search: search?.trim(),
          role: role?.trim(),
        },
      }),
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  });
};
