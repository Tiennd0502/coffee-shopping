'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import {
  LIST_QUERY_GC_MS,
  LIST_QUERY_STALE_MS,
  PAGE_SIZE,
} from '@/constants/common'
import {
  deleteUserById,
  fetchUsers,
  type FetchUsersOptions,
  updateUserById,
} from '@/services/user'
import type { User, USER_ROLES } from '@/types/user'
import { type ResponseMeta } from '@/types/api'

export type UseUsersParams = FetchUsersOptions

const usersQueryRoot = ['users'] as const

function invalidateUserLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: usersQueryRoot })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; role: USER_ROLES }) => {
      const result = await updateUserById(input.id, input.role)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return result.user
    },
    onSuccess: () => {
      void invalidateUserLists(queryClient)
    },
  })
}

interface UsersListCache {
  users: User[]
  meta: ResponseMeta | null
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteUserById(id)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: async (_result, deletedId) => {
      await queryClient.cancelQueries({ queryKey: usersQueryRoot })

      const deleted = String(deletedId).trim()
      queryClient.setQueriesData<UsersListCache>(
        { queryKey: ['users', 'list'], type: 'all' },
        (old) => {
          if (!old) return old
          const users = old.users.filter(
            (u) => String(u.id ?? '').trim() !== deleted,
          )
          if (users.length === old.users.length) return old
          const meta = old.meta
            ? {
                ...old.meta,
                totalCount: Math.max(0, old.meta.totalCount - 1),
              }
            : null
          return { users, meta }
        },
      )
      await invalidateUserLists(queryClient)
    },
  })
}

export interface UseUserResult {
  users: User[]
  meta: ResponseMeta | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function usersListQueryKey(params: FetchUsersOptions) {
  return [
    'users',
    'list',
    params.page ?? 1,
    params.limit ?? PAGE_SIZE,
    params.search ?? '',
    params.role ?? '',
  ] as const
}

export const useUsers = (params: UseUsersParams = {}): UseUserResult => {
  const query = useQuery({
    queryKey: usersListQueryKey(params),
    queryFn: async () => {
      const result = await fetchUsers(params)
      if (!result.ok) {
        throw new Error(result.error)
      }
      return {
        users: result.users,
        meta: result.meta ?? null,
      }
    },
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
  })

  return {
    users: query.data?.users ?? [],
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
