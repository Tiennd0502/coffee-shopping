import type { User } from '@repo/types';
import type { USER_ROLE } from '@repo/types';
import type { Response, ResponseMeta } from '@/types/api';

import { API_ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/api';

export interface FetchUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export async function fetchUser(): Promise<
  { ok: true; user: User } | { ok: false; error: string; status?: number }
> {
  const result = await apiClient.get<Response<User>>(API_ROUTES.ME);
  if (!result.ok) return result;

  return { ok: true, user: result.data.data };
}

export async function fetchUsers(
  options: FetchUsersOptions = {},
): Promise<
  { ok: true; users: User[]; meta?: ResponseMeta } | { ok: false; error: string; status?: number }
> {
  const { page, limit, search, role } = options;
  const result = await apiClient.get<Response<User[]>>(API_ROUTES.USERS, {
    query: {
      page,
      limit,
      search: search?.trim(),
      role: role?.trim(),
    },
  });
  if (!result.ok) return result;

  const { data, meta } = result.data;
  const users = Array.isArray(data) ? data : [];

  return { ok: true, users, meta };
}

export async function updateUserById(
  id: string,
  role: USER_ROLE,
): Promise<{ ok: true; user: User } | { ok: false; error: string; status?: number }> {
  const result = await apiClient.patch<Response<User>>(`${API_ROUTES.USERS}/${id}`, { role });
  if (!result.ok) return result;

  return { ok: true, user: result.data.data };
}

export async function deleteUserById(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const trimmed = id.trim();
  const url = `${API_ROUTES.USERS}/${encodeURIComponent(trimmed)}`;
  const result = await apiClient.delete(url);
  if (!result.ok) return result;

  return { ok: true };
}
