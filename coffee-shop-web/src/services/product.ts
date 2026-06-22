import { API_FALLBACK_ERRORS } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import type { Response as ApiResponse, ResponseMeta } from '@/types/api'
import { apiClient } from '@/services/api'
import type {
  Product,
  ProductPayload,
  ProductUpdatePayload,
} from '@/types/product'

export interface ProductOptions {
  getToken?: () => Promise<string | null>
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  roastLevel?: string
  sortBy?: string
}

export async function createProduct(
  body: ProductPayload,
  options: ProductOptions = {},
): Promise<
  { ok: true; product: Product } | { ok: false; error: string; status?: number }
> {
  const result = await apiClient.post<unknown>(API_ROUTES.PRODUCTS, body, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.PRODUCT_CREATE,
  })
  if (!result.ok) return result

  const json = result.data
  let parsedProduct: Product | null = null
  if (json && typeof json === 'object') {
    const root = json as Record<string, unknown>
    const data = root.data
    if (data && typeof data === 'object') {
      parsedProduct = data as Product
    } else {
      parsedProduct = root as unknown as Product
    }
  }

  return {
    ok: true,
    product:
      parsedProduct ??
      ({
        id: '',
        ...body,
        createdAt: null,
        updatedAt: null,
      } as Product),
  }
}

export async function fetchProducts(
  options: ProductOptions = {},
): Promise<
  | { ok: true; products: Product[]; meta?: ResponseMeta }
  | { ok: false; error: string; status?: number }
> {
  const {
    getToken,
    page,
    limit,
    search,
    categoryId,
    status,
    minPrice,
    maxPrice,
    roastLevel,
    sortBy,
  } = options
  const result = await apiClient.get<ApiResponse<Product[]>>(
    API_ROUTES.PRODUCTS,
    {
      getToken,
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
      fallbackError: API_FALLBACK_ERRORS.PRODUCTS_LOAD,
    },
  )
  if (!result.ok) return result

  const { data, meta } = result.data
  return { ok: true, products: data, meta }
}

export async function deleteProduct(
  id: string,
  options: Pick<ProductOptions, 'getToken'> = {},
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.PRODUCTS}/${encodeURIComponent(trimmed)}`
  const result = await apiClient.delete(url, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.PRODUCT_DELETE,
  })
  if (!result.ok) return result
  return { ok: true }
}

function isProductShape(value: object): value is Product {
  return (
    'id' in value &&
    typeof (value as Record<string, unknown>).id === 'string' &&
    'name' in value &&
    typeof (value as Record<string, unknown>).name === 'string'
  )
}

function parseProductFromResponse(json: unknown): Product | null {
  if (!json || typeof json !== 'object') return null
  const root = json as Record<string, unknown>
  const data = root.data
  if (data && typeof data === 'object' && isProductShape(data)) {
    return data
  }
  if (isProductShape(root)) {
    return root as unknown as Product
  }
  return null
}

export async function fetchProductById(
  id: string,
  options: Pick<ProductOptions, 'getToken'> = {},
): Promise<
  { ok: true; product: Product } | { ok: false; error: string; status?: number }
> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.PRODUCTS}/${encodeURIComponent(trimmed)}`
  const result = await apiClient.get<ApiResponse<Product>>(url, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.PRODUCT_LOAD,
  })
  if (!result.ok) return result

  const parsed = parseProductFromResponse(result.data)
  if (!parsed) {
    return { ok: false, error: API_FALLBACK_ERRORS.PRODUCT_LOAD }
  }
  return { ok: true, product: parsed }
}

function isProductUpdatePayload(
  body: ProductPayload | ProductUpdatePayload,
): body is ProductUpdatePayload {
  return 'addImages' in body && !('images' in body)
}

export async function updateProduct(
  id: string,
  body: ProductPayload | ProductUpdatePayload,
  options: Pick<ProductOptions, 'getToken'> = {},
): Promise<
  { ok: true; product: Product } | { ok: false; error: string; status?: number }
> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.PRODUCTS}/${encodeURIComponent(trimmed)}`
  const opts = {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.PRODUCT_UPDATE,
  }

  let result = await apiClient.patch<unknown>(url, body, opts)
  if (!result.ok && (result.status === 404 || result.status === 405)) {
    result = await apiClient.put<unknown>(url, body, opts)
  }
  if (!result.ok) return result

  const parsedProduct = parseProductFromResponse(result.data)
  if (parsedProduct) {
    return { ok: true, product: parsedProduct }
  }

  const refetched = await fetchProductById(trimmed, options)
  if (refetched.ok) {
    return { ok: true, product: refetched.product }
  }

  if ('images' in body && !isProductUpdatePayload(body)) {
    return {
      ok: true,
      product: {
        id: trimmed,
        ...body,
        createdAt: null,
        updatedAt: null,
      },
    }
  }

  if (isProductUpdatePayload(body)) {
    const {
      addImages: _a,
      removeImageIds: _r,
      updateImages: _u,
      ...core
    } = body
    return {
      ok: true,
      product: {
        id: trimmed,
        ...core,
        images: [],
        variants: [],
        createdAt: null,
        updatedAt: null,
      },
    }
  }

  return {
    ok: false,
    error: API_FALLBACK_ERRORS.PRODUCT_UPDATE,
  }
}
