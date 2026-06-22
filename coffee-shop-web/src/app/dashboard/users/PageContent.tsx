'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Printer, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

// Types
import type { USER_ROLES, User } from '@/types/user'

// Constants
import { ROUTES } from '@/constants/routes'
import { SEARCH_URL_DEBOUNCE_MS } from '@/constants/common'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'
import { ROLE_FILTER_OPTIONS, USERS_TABLE_COLUMNS } from '@/constants/user'

// Hooks
import { useDeleteUser, useUpdateUserRole, useUsers } from '@/hooks/useUser'
import { useUrlState } from '@/hooks/useUrlState'

// Components
import Breadcrumb from '@/components/Breadcrumb'
import AlertDialog from '@/components/AlertDialog'
import Table from '@/components/Table'
import { PaginationBar } from '@/components/Pagination'
import { Select } from '@/components/Select'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { UserTableRow } from '@/sections/UserTableRow'

// Utils
import { userUrlSchema } from '@/utils/url'
import Loading from '@/components/Loading'

export const PageContent = () => {
  const { state, update: updateUrl } = useUrlState(userUrlSchema)
  const { page, search, role, limit } = state
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchInput, setSearchInput] = useState(search)
  const updateUrlRef = useRef(updateUrl)
  const urlSearchRef = useRef(search)
  const lastUrlSearchSynced = useRef<string | null>(null)
  updateUrlRef.current = updateUrl
  urlSearchRef.current = search

  useEffect(() => {
    if (lastUrlSearchSynced.current === null) {
      lastUrlSearchSynced.current = search
      return
    }
    if (search === lastUrlSearchSynced.current) return
    lastUrlSearchSynced.current = search
    if (searchInputRef.current === document.activeElement) return
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchInput === urlSearchRef.current) return
      updateUrlRef.current({ search: searchInput, page: 1 })
    }, SEARCH_URL_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchInput])

  const normalizedRole =
    role &&
    role !== ROLE_FILTER_OPTIONS[0] &&
    (ROLE_FILTER_OPTIONS as readonly string[]).includes(role)
      ? role
      : null

  const { users, meta, isLoading, isError, errorMessage, refetch } = useUsers({
    page,
    limit,
    search: search.trim(),
    role: normalizedRole ?? undefined,
  })

  const totalPages = Math.max(1, meta?.pageCount ?? 1)
  const totalCount = meta?.totalCount ?? users.length
  const showingCount = users.length
  const [pendingRoleUserId, setPendingRoleUserId] = useState<string | null>(
    null,
  )
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  )
  const [optimisticRoles, setOptimisticRoles] = useState<
    Partial<Record<string, USER_ROLES>>
  >({})
  const { mutate: updateUserRoleMutate } = useUpdateUserRole()
  const { mutate: deleteUserMutate, isPending: isDeletePending } =
    useDeleteUser()

  useEffect(() => {
    if (page > totalPages) {
      updateUrl({ page: totalPages })
    }
  }, [page, totalPages, updateUrl])

  useEffect(() => {
    setOptimisticRoles((current) => {
      let hasChanged = false
      const next = { ...current }
      users.forEach((user) => {
        const userId = user.id
        if (!userId) return
        if (next[userId] && next[userId] === user.role) {
          delete next[userId]
          hasChanged = true
        }
      })
      return hasChanged ? next : current
    })
  }, [users])

  const handleRoleChange = (value: unknown) => {
    if (typeof value !== 'string') return
    updateUrl({
      role: value === ROLE_FILTER_OPTIONS[0] ? null : value,
      page: 1,
    })
  }

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleUserRoleUpdate = (user: User, nextRole: USER_ROLES) => {
    const userId = user.id
    if (!userId) return

    setOptimisticRoles((current) => ({ ...current, [userId]: nextRole }))
    setPendingRoleUserId(userId)
    updateUserRoleMutate(
      { id: userId, role: nextRole },
      {
        onSuccess: () => {
          toast.success(SUCCESS_MESSAGES.USER_ROLE_UPDATED)
        },
        onError: (error) => {
          setOptimisticRoles((current) => {
            const next = { ...current }
            delete next[userId]
            return next
          })
          toast.error(
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.NETWORK_ERROR,
          )
        },
        onSettled: () => {
          setPendingRoleUserId((current) =>
            current === userId ? null : current,
          )
        },
      },
    )
  }

  const handleUserDeleteRequest = (user: User) => {
    if (!user.id) return
    setDeleteErrorMessage(null)
    setPendingDeleteUser(user)
  }

  const pendingDeleteLabel = (() => {
    if (!pendingDeleteUser) {
      return 'this user'
    }
    const name = [pendingDeleteUser.firstName, pendingDeleteUser.lastName]
      .filter(
        (part): part is string =>
          typeof part === 'string' && part.trim().length > 0,
      )
      .join(' ')
      .trim()
    if (name.length > 0) {
      return name
    }
    return pendingDeleteUser.email ?? 'this user'
  })()

  return (
    <div className="flex flex-col gap-6">
      <AlertDialog
        data-testid="modal-confirm-delete-user"
        open={pendingDeleteUser !== null}
        isLoading={isDeletePending}
        errorMessage={deleteErrorMessage}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteUser(null)
            setDeleteErrorMessage(null)
          }
        }}
        title="Delete user?"
        description={
          <p>
            Are you sure you want to delete <b>{pendingDeleteLabel}</b>? This
            action cannot be undone.
          </p>
        }
        textAction="Delete"
        onClickAction={() => {
          const userId = pendingDeleteUser?.id
          if (!userId) return
          setDeleteErrorMessage(null)
          deleteUserMutate(userId, {
            onSuccess: () => {
              toast.success(SUCCESS_MESSAGES.USER_DELETED)
              setPendingDeleteUser(null)
              setDeleteErrorMessage(null)
            },
            onError: (error) => {
              setDeleteErrorMessage(
                error instanceof Error
                  ? error.message
                  : ERROR_MESSAGES.NETWORK_ERROR,
              )
            },
          })
        }}
      />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: ROUTES.DASHBOARD },
              { label: 'Users', href: ROUTES.DASHBOARD_USERS },
            ]}
          />
          <div className="space-y-2">
            <h1 className="text-5xl leading-tight font-bold tracking-tight text-foreground">
              Manage Users
            </h1>
            <p className="text-lg text-muted-foreground">
              Oversee your brewing staff and editorial curators.
            </p>
          </div>
        </div>
        <div className="flex w-full justify-end sm:w-auto">
          <Button
            variant="default"
            size="default"
            disabled
            className="w-full gap-2 px-8 sm:w-auto"
          >
            <UserPlus className="size-4" aria-hidden />
            Invite User
          </Button>
        </div>
      </header>

      {/* <StatsCards items={USERS_DASHBOARD_STATS} /> */}

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card">
        <div className="flex min-w-0 flex-col gap-3 border-b border-outline-variant/30 p-4 md:flex-row md:flex-wrap md:items-center md:gap-3 lg:justify-between">
          <SearchInput
            ref={searchInputRef}
            value={searchInput}
            onChange={handleQueryChange}
            placeholder="Filter by name or email..."
            aria-label="Filter users by name or email"
            containerClassName="h-12 bg-surface-container-high w-full md:w-auto md:min-w-0 md:max-w-md md:flex-1"
          />
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
            <div className="min-w-40">
              <Select
                classNameTrigger="rounded-full capitalize"
                selected={normalizedRole ?? ROLE_FILTER_OPTIONS[0]}
                onValueChange={handleRoleChange}
                options={ROLE_FILTER_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
                placeholder="All Roles"
              />
            </div>
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Export users list"
              className="size-11"
            >
              <Download className="size-4" aria-hidden />
            </Button>
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Print users list"
              className="size-11"
            >
              <Printer className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <Loading />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button
              className="w-fit px-6"
              variant="destructive"
              size="sm"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={USERS_TABLE_COLUMNS}
            data={users}
            getRowKey={(user, index) => user.id ?? `user-${index}`}
            resolveRowClassName={(user) =>
              user.deletedAt
                ? 'border-b border-border bg-muted-foreground/20'
                : ''
            }
            renderRow={(user) => (
              <UserTableRow
                user={
                  user.id && optimisticRoles[user.id]
                    ? { ...user, role: optimisticRoles[user.id] }
                    : user
                }
                onRequestRoleChange={handleUserRoleUpdate}
                onRequestDelete={handleUserDeleteRequest}
                isRoleDisabled={
                  pendingRoleUserId === user.id || Boolean(user.deletedAt)
                }
                isDeleteDisabled={isDeletePending || Boolean(user.deletedAt)}
              />
            )}
          />
        )}

        <footer className="border-t border-outline-variant/30 px-6 py-4">
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(next) => updateUrl({ page: next })}
            showingCount={showingCount}
            totalCount={totalCount}
          />
        </footer>
      </section>
    </div>
  )
}
