import { API_FALLBACK_ERRORS, ERROR_MESSAGES } from '@/constants/messages';
import { API_ROUTES } from '@/constants/routes';
import { deleteUserById, fetchUsers } from '@/services/user';
import { USER_ROLE } from '@repo/types';

describe('fetchUsers', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('calls users endpoint and returns parsed users', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 'u-1', email: 'user@example.com', role: 'USER' }],
      }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await fetchUsers();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_ROUTES.USERS}`,
      expect.objectContaining({
        credentials: 'include',
      }),
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.headers).toBeInstanceOf(Headers);
    expect((init?.headers as Headers).get('Accept')).toBe('application/json');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.users).toHaveLength(1);
      expect(result.users[0].id).toBe('u-1');
      expect(result.users[0].role).toBe(USER_ROLE.USER);
    }
  });

  it('appends page and limit as query params when provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    await fetchUsers({ page: 2, limit: 15 });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_ROUTES.USERS}?page=2&limit=15`,
      expect.any(Object),
    );
  });

  it('appends search and role query params when provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    await fetchUsers({ search: '  ada  ', role: 'ADMIN' });

    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl.startsWith(`${API_ROUTES.USERS}?`)).toBe(true);
    expect(calledUrl).toContain('search=ada');
    expect(calledUrl).toContain('role=ADMIN');
  });

  it('returns http error when response is not ok', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await fetchUsers();

    expect(result).toEqual({
      ok: false,
      status: 403,
    });
  });

  it('returns network error when fetch throws non-error value', async () => {
    const fetchMock = jest.fn().mockRejectedValue('boom');
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await fetchUsers();

    expect(result).toEqual({ ok: false, error: ERROR_MESSAGES.NETWORK_ERROR });
  });
});

describe('deleteUserById', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('calls delete user endpoint and returns ok true', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
      text: async () => '',
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await deleteUserById('u-123');

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_ROUTES.USERS}/u-123`,
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('returns fallback error with status when delete fails', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: API_FALLBACK_ERRORS.USER_DELETE }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await deleteUserById('u-403');

    expect(result).toEqual({
      ok: false,
      error: API_FALLBACK_ERRORS.USER_DELETE,
      status: 403,
      errorResponse: undefined,
    });
  });

  it('returns network error when delete throws non-error value', async () => {
    const fetchMock = jest.fn().mockRejectedValue('boom');
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await deleteUserById('u-x');

    expect(result).toEqual({ ok: false, error: ERROR_MESSAGES.NETWORK_ERROR });
  });
});
