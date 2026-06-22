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
  createCategory,
  deleteCategory,
  fetchCategoryById,
  fetchCategories,
  updateCategory,
  type CategoryOptions,
} from '@/services/category'
import type { Category, CategoryPayload } from '@/types/category'
import type { ResponseMeta } from '@/types/api'

export interface UseCategoriesResult {
  categories: Category[]
  meta: ResponseMeta | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function categoriesListQueryKey(params: CategoryOptions) {
  return [
    'categories',
    'list',
    params.page ?? 1,
    params.limit ?? PAGE_SIZE,
    params.search ?? '',
  ] as const
}

const categoriesQueryRoot = ['categories'] as const

const listQueryOptions = {
  staleTime: LIST_QUERY_STALE_MS,
  gcTime: LIST_QUERY_GC_MS,
  placeholderData: keepPreviousData,
} as const

const detailQueryOptions = {
  staleTime: LIST_QUERY_STALE_MS,
  gcTime: LIST_QUERY_GC_MS,
} as const

export function categoryDetailQueryKey(id: string) {
  return ['categories', 'detail', id] as const
}

function invalidateCategoryLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: categoriesQueryRoot })
}

function throwIfServiceFailed(result: { ok: false; error: string }): never {
  throw new Error(result.error)
}

export const useCategories = (
  params: CategoryOptions = {},
): UseCategoriesResult => {
  const query = useQuery({
    queryKey: categoriesListQueryKey(params),
    queryFn: async () => {
      const result = await fetchCategories(params)
      if (!result.ok) throwIfServiceFailed(result)

      return {
        categories: result.categories,
        meta: result.meta ?? null,
      }
    },
    ...listQueryOptions,
  })

  return {
    categories: query.data?.categories ?? [],
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

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CategoryPayload) => {
      const result = await createCategory(body)
      if (!result.ok) throwIfServiceFailed(result)
      return result.category
    },
    onSuccess: () => {
      void invalidateCategoryLists(queryClient)
    },
  })
}

interface CategoriesListCache {
  categories: Category[]
  meta: ResponseMeta | null
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategory(id)
      if (!result.ok) throwIfServiceFailed(result)
    },
    onSuccess: async (_result, deletedId) => {
      queryClient.setQueriesData<CategoriesListCache>(
        { queryKey: ['categories', 'list'] },
        (old) => {
          if (!old) return old
          const categories = old.categories.filter((c) => c.id !== deletedId)
          if (categories.length === old.categories.length) return old
          const meta = old.meta
            ? {
                ...old.meta,
                totalCount: Math.max(0, old.meta.totalCount - 1),
              }
            : null
          return { categories, meta }
        },
      )
      await invalidateCategoryLists(queryClient)
    },
  })
}

export interface UseCategoryByIdResult {
  category: Category | null
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  refetch: () => Promise<void>
}

export function useCategoryById(id: string): UseCategoryByIdResult {
  const query = useQuery({
    queryKey: categoryDetailQueryKey(id),
    queryFn: async () => {
      const result = await fetchCategoryById(id)
      if (!result.ok) throwIfServiceFailed(result)
      return result.category
    },
    enabled: Boolean(id?.trim()),
    ...detailQueryOptions,
  })

  return {
    category: query.data ?? null,
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

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { id: string; body: CategoryPayload }) => {
      const result = await updateCategory(input.id, input.body)
      if (!result.ok) throwIfServiceFailed(result)
      return result.category
    },
    onSuccess: (_data, variables) => {
      void invalidateCategoryLists(queryClient)
      void queryClient.invalidateQueries({
        queryKey: categoryDetailQueryKey(variables.id.trim()),
      })
    },
  })
}
