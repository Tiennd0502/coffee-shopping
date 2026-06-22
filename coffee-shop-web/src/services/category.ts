import { API_FALLBACK_ERRORS } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import type { Category, CategoryPayload } from '@/types/category'
import type { Response as ApiResponse, ResponseMeta } from '@/types/api'
import { apiClient } from '@/services/api'

export interface CategoryOptions {
  getToken?: () => Promise<string | null>
  page?: number
  limit?: number
  search?: string
}

export async function createCategory(
  body: CategoryPayload,
  options: Pick<CategoryOptions, 'getToken'> = {},
): Promise<
  | { ok: true; category: Category }
  | { ok: false; error: string; status?: number }
> {
  const { getToken } = options
  const result = await apiClient.post<unknown>(API_ROUTES.CATEGORIES, body, {
    getToken,
    fallbackError: API_FALLBACK_ERRORS.CATEGORY_CREATE,
  })
  if (!result.ok) return result

  const json = result.data
  let parsedCategory: Category | null = null
  if (json && typeof json === 'object') {
    const root = json as Record<string, unknown>
    const data = root.data
    if (data && typeof data === 'object') {
      parsedCategory = data as Category
    } else {
      parsedCategory = root as unknown as Category
    }
  }

  return {
    ok: true,
    category:
      parsedCategory ??
      ({
        id: '',
        name: body.name,
        slug: '',
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
      } as Category),
  }
}

export async function deleteCategory(
  id: string,
  options: Pick<CategoryOptions, 'getToken'> = {},
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.CATEGORIES}/${encodeURIComponent(trimmed)}`
  const result = await apiClient.delete(url, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.CATEGORY_DELETE,
  })
  if (!result.ok) return result

  return { ok: true }
}

export async function fetchCategories(
  options: CategoryOptions = {},
): Promise<
  | { ok: true; categories: Category[]; meta?: ResponseMeta }
  | { ok: false; error: string; status?: number }
> {
  const { getToken, page, limit, search } = options
  const result = await apiClient.get<ApiResponse<Category[]>>(
    API_ROUTES.CATEGORIES,
    {
      getToken,
      query: { page, limit, search: search?.trim() },
      fallbackError: API_FALLBACK_ERRORS.CATEGORIES_LOAD,
    },
  )
  if (!result.ok) return result

  const { data, meta } = result.data
  return { ok: true, categories: data, meta }
}

export async function fetchCategoryById(
  id: string,
  options: Pick<CategoryOptions, 'getToken'> = {},
): Promise<
  | { ok: true; category: Category }
  | { ok: false; error: string; status?: number }
> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.CATEGORIES}/${encodeURIComponent(trimmed)}`
  const result = await apiClient.get<ApiResponse<Category>>(url, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.CATEGORY_LOAD,
  })
  if (!result.ok) return result

  return { ok: true, category: result.data.data }
}

export async function updateCategory(
  id: string,
  body: CategoryPayload,
  options: Pick<CategoryOptions, 'getToken'> = {},
): Promise<
  | { ok: true; category: Category }
  | { ok: false; error: string; status?: number }
> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.CATEGORIES}/${encodeURIComponent(trimmed)}`
  const requestOptions = {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.CATEGORY_UPDATE,
  }

  let result = await apiClient.patch<unknown>(url, body, requestOptions)
  if (!result.ok && (result.status === 404 || result.status === 405)) {
    result = await apiClient.put<unknown>(url, body, requestOptions)
  }
  if (!result.ok) return result

  const parsed = result.data as ApiResponse<Category>
  if (parsed.data) {
    return { ok: true, category: parsed.data }
  }

  const refetched = await fetchCategoryById(trimmed, options)
  if (refetched.ok) {
    return { ok: true, category: refetched.category }
  }

  return {
    ok: true,
    category: {
      id: trimmed,
      name: body.name,
      slug: '',
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    },
  }
}
