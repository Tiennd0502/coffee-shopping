import { API_FALLBACK_ERRORS } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import { fetchCategoryById, updateCategory } from '@/services/category'

describe('category service update flows', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('fetchCategoryById returns parsed category from data', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: 'cat-1',
          name: 'Coffee',
          slug: 'coffee',
          createdBy: null,
          updatedBy: null,
          deletedBy: null,
          createdAt: null,
          updatedAt: null,
          deletedAt: null,
        },
      }),
    } as globalThis.Response)
    globalThis.fetch = fetchMock as typeof fetch

    const result = await fetchCategoryById('cat-1')

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_ROUTES.CATEGORIES}/cat-1`,
      expect.objectContaining({
        credentials: 'include',
      }),
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.category.id).toBe('cat-1')
      expect(result.category.name).toBe('Coffee')
    }
  })

  it('updateCategory falls back to PUT when PATCH is not supported', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: async () => ({ message: 'Method not allowed' }),
      } as globalThis.Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            id: 'cat-1',
            name: 'Espresso',
            slug: 'espresso',
            createdBy: null,
            updatedBy: null,
            deletedBy: null,
            createdAt: null,
            updatedAt: null,
            deletedAt: null,
          },
        }),
      } as globalThis.Response)
    globalThis.fetch = fetchMock as typeof fetch

    const result = await updateCategory('cat-1', { name: 'Espresso' })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${API_ROUTES.CATEGORIES}/cat-1`,
      expect.objectContaining({
        method: 'PATCH',
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${API_ROUTES.CATEGORIES}/cat-1`,
      expect.objectContaining({
        method: 'PUT',
      }),
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.category.name).toBe('Espresso')
    }
  })

  it('updateCategory returns API fallback error for failed response', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: '' }),
    } as globalThis.Response)
    globalThis.fetch = fetchMock as typeof fetch

    const result = await updateCategory('cat-1', { name: 'Failing' })

    expect(result).toEqual({
      ok: false,
      error: `${API_FALLBACK_ERRORS.CATEGORY_UPDATE} (500)`,
      status: 500,
    })
  })
})
