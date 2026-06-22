import type { User } from '@/types/user'
import { USER_ROLES, USER_STATUS } from '@/types/user'
import type { Response, ResponseMeta } from '@/types/api'

import { API_FALLBACK_ERRORS, ERROR_MESSAGES } from '@/constants/messages'
import { API_ROUTES } from '@/constants/routes'
import { apiClient } from '@/services/api'

export interface FetchUsersOptions {
  getToken?: () => Promise<string | null>
  page?: number
  limit?: number
  search?: string
  role?: string
}

function readString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

function getRole(value: unknown): User['role'] {
  if (typeof value !== 'string') return undefined

  const normalized = value.trim().toUpperCase()
  if (normalized === USER_ROLES.ADMIN || normalized === 'MANAGER') {
    return USER_ROLES.ADMIN
  }
  if (normalized === USER_ROLES.USER || normalized === 'BARISTA') {
    return USER_ROLES.USER
  }

  return undefined
}

function getStatus(value: unknown): User['status'] {
  if (typeof value !== 'string') return undefined

  const normalized = value.trim().toUpperCase()
  if (normalized === USER_STATUS.ACTIVE) {
    return USER_STATUS.ACTIVE
  }
  if (normalized === USER_STATUS.INACTIVE) {
    return USER_STATUS.INACTIVE
  }

  return undefined
}

function readAddressFromAddresses(value: unknown): User['address'] {
  if (!Array.isArray(value) || value.length === 0) return null

  const address = value.filter(
    (item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item),
  )
  if (!address.length) return null

  return address[0] as User['address']
}

function readDeletedAt(payload: Record<string, unknown>): string | null {
  const raw =
    payload.deletedAt !== undefined ? payload.deletedAt : payload.deleted_at
  if (typeof raw !== 'string' || !raw.trim()) return null
  return raw.trim()
}

function normalizeUserListItem(item: unknown): User | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null

  const payload = item as Record<string, unknown>
  const id =
    readString(payload.id) ??
    readString(payload.userId) ??
    readString(payload.user_id) ??
    readString(payload.sub)

  if (!id) return null

  const firstName =
    readString(payload.firstName) ?? readString(payload.first_name)
  const lastName = readString(payload.lastName) ?? readString(payload.last_name)
  const email = readString(payload.email)
  const joined = [firstName, lastName].filter(Boolean).join(' ').trim()
  const name = readString(payload.name) ?? (joined.length > 0 ? joined : null)
  const imageUrl =
    readString(payload.imageUrl) ??
    readString(payload.image_url) ??
    readString(payload.avatarUrl) ??
    readString(payload.avatar_url) ??
    readString(payload.picture)
  const address = readAddressFromAddresses(payload.addresses)
  const role = getRole(payload.role)
  const status = getStatus(payload.status)
  const deletedAt = readDeletedAt(payload)

  return {
    id,
    deletedAt,
    email,
    firstName,
    lastName,
    address,
    name,
    avatarUrl: imageUrl,
    role,
    status,
  }
}

export async function fetchUser(
  getToken?: () => Promise<string | null>,
): Promise<
  { ok: true; user: User } | { ok: false; error: string; status?: number }
> {
  const result = await apiClient.get<unknown>(API_ROUTES.ME, {
    getToken,
    fallbackError: API_FALLBACK_ERRORS.PROFILE_LOAD,
  })
  if (!result.ok) return result

  if (!result.data || typeof result.data !== 'object') {
    return {
      ok: false,
      error: ERROR_MESSAGES.UNEXPECTED_PROFILE_RESPONSE,
    }
  }

  const root = result.data as Record<string, unknown>
  const payload =
    root.data !== undefined &&
    root.data !== null &&
    typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root

  const id =
    readString(payload.id) ??
    readString(payload.userId) ??
    readString(payload.sub) ??
    (typeof payload.email === 'string' && payload.email.trim()
      ? payload.email.trim()
      : null)

  if (!id) {
    return {
      ok: false,
      error: ERROR_MESSAGES.UNEXPECTED_PROFILE_RESPONSE,
    }
  }

  const firstName =
    readString(payload.firstName) ?? readString(payload.first_name)
  const lastName = readString(payload.lastName) ?? readString(payload.last_name)
  const email = readString(payload.email)
  const joined = [firstName, lastName].filter(Boolean).join(' ').trim()
  const name = readString(payload.name) ?? (joined.length > 0 ? joined : null)
  const imageUrl =
    readString(payload.imageUrl) ??
    readString(payload.image_url) ??
    readString(payload.avatarUrl) ??
    readString(payload.avatar_url) ??
    readString(payload.picture)
  const address = readAddressFromAddresses(payload.addresses)
  const role = getRole(payload.role)
  const status = getStatus(payload.status)
  const deletedAt = readDeletedAt(payload)
  const user: User = {
    id,
    deletedAt,
    email,
    firstName,
    lastName,
    address,
    name,
    avatarUrl: imageUrl,
    role,
    status,
  }

  return { ok: true, user }
}

export async function fetchUsers(
  options: FetchUsersOptions = {},
): Promise<
  | { ok: true; users: User[]; meta?: ResponseMeta }
  | { ok: false; error: string; status?: number }
> {
  const { getToken, page, limit, search, role } = options
  const result = await apiClient.get<Response<User[]>>(API_ROUTES.USERS, {
    getToken,
    query: {
      page,
      limit,
      search: search?.trim(),
      role: role?.trim(),
    },
    fallbackError: API_FALLBACK_ERRORS.USERS_LOAD,
  })
  if (!result.ok) return result

  const { data, meta } = result.data
  const rawList = Array.isArray(data) ? data : []
  const users = rawList
    .map(normalizeUserListItem)
    .filter((u): u is User => u !== null)

  return { ok: true, users, meta }
}

export async function updateUserById(
  id: string,
  role: USER_ROLES,
  options: Pick<FetchUsersOptions, 'getToken'> = {},
): Promise<
  { ok: true; user: User } | { ok: false; error: string; status?: number }
> {
  const result = await apiClient.patch<Response<User>>(
    `${API_ROUTES.USERS}/${id}`,
    { role },
    {
      getToken: options.getToken,
      fallbackError: API_FALLBACK_ERRORS.USER_UPDATE,
    },
  )
  if (!result.ok) return result

  return { ok: true, user: result.data.data }
}

export async function deleteUserById(
  id: string,
  options: Pick<FetchUsersOptions, 'getToken'> = {},
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const trimmed = id.trim()
  const url = `${API_ROUTES.USERS}/${encodeURIComponent(trimmed)}`
  const result = await apiClient.delete(url, {
    getToken: options.getToken,
    fallbackError: API_FALLBACK_ERRORS.USER_DELETE,
  })
  if (!result.ok) return result

  return { ok: true }
}
