'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Download, Printer, Tag } from 'lucide-react'
import { toast } from 'sonner'

// Constants
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { SEARCH_URL_DEBOUNCE_MS } from '@/constants/common'
import { CATEGORIES_TABLE_COLUMNS } from '@/constants/category'

// Hooks
import { useCategories, useDeleteCategory } from '@/hooks/useCategory'
import { useUrlState } from '@/hooks/useUrlState'

// Components
import AlertDialog from '@/components/AlertDialog'
import Breadcrumb from '@/components/Breadcrumb'
import Table from '@/components/Table'
import { PaginationBar } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { Button, buttonVariants } from '@/components/ui/button'
import { CategoryTableRow } from '@/sections/CategoryTableRow'

// Utils
import { urlSchema } from '@/utils/url'
import { cn } from '@/utils/styles'
import Loading from '@/components/Loading'

interface PendingDelete {
  id: string
  name: string
  slug: string
}

export const PageContent = () => {
  const { state, update: updateUrl } = useUrlState(urlSchema)
  const { page, search, limit } = state
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  )
  const { mutate: deleteCategoryMutate, isPending: isDeletePending } =
    useDeleteCategory()
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

  const { categories, meta, isLoading, isError, errorMessage } = useCategories({
    page,
    limit,
    search: search.trim(),
  })

  const totalPages = Math.max(1, meta?.pageCount ?? 1)
  const totalCount = meta?.totalCount ?? categories.length
  const showingCount = categories.length

  useEffect(() => {
    if (page > totalPages) {
      updateUrl({ page: totalPages })
    }
  }, [page, totalPages, updateUrl])

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  return (
    <div className="flex flex-col gap-6">
      <AlertDialog
        data-testid="modal-confirm-delete-category"
        open={pendingDelete !== null}
        isLoading={isDeletePending}
        errorMessage={deleteErrorMessage}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setDeleteErrorMessage(null)
          }
        }}
        title="Remove this category?"
        description={
          <p>
            This will remove <b>{pendingDelete?.name}</b> (
            <b>{pendingDelete?.slug}</b>). It may still appear in this list with
            the Removed badge.
          </p>
        }
        textAction="Delete"
        onClickAction={() => {
          const id = pendingDelete?.id
          if (!id) return
          setDeleteErrorMessage(null)
          deleteCategoryMutate(id, {
            onSuccess: () => {
              toast.success(SUCCESS_MESSAGES.CATEGORY_DELETED)
              setPendingDelete(null)
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
              { label: 'Categories', href: ROUTES.DASHBOARD_CATEGORIES },
            ]}
          />
          <div className="space-y-2">
            <h1 className="text-5xl leading-tight font-bold tracking-tight text-foreground">
              Manage Categories
            </h1>
            <p className="text-lg text-muted-foreground">
              Organize product taxonomy, slugs, and editorial groupings.
            </p>
          </div>
        </div>
        <div className="flex w-full justify-end sm:w-auto">
          <Link
            href={ROUTES.DASHBOARD_CATEGORIES_ADD}
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              'inline-flex w-full gap-2 px-8 sm:w-auto',
            )}
          >
            <Tag className="size-4" aria-hidden />
            Add category
          </Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card">
        <div className="flex min-w-0 flex-col gap-3 border-b border-outline-variant/30 p-4 md:flex-row md:flex-wrap md:items-center md:gap-3 lg:justify-between">
          <SearchInput
            ref={searchInputRef}
            value={searchInput}
            onChange={handleQueryChange}
            placeholder="Filter by name or slug..."
            aria-label="Filter categories by name or slug"
            containerClassName="h-12 bg-surface-container-high w-full md:w-auto md:min-w-0 md:max-w-md md:flex-1"
          />
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Export categories list"
              className="size-11"
            >
              <Download className="size-4" aria-hidden />
            </Button>
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Print categories list"
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
          </div>
        ) : (
          <Table
            columns={CATEGORIES_TABLE_COLUMNS}
            data={categories}
            getRowKey={(row, index) => row.id ?? `category-${index}`}
            resolveRowClassName={(row) =>
              row.deletedAt
                ? 'border-b border-border bg-muted-foreground/20'
                : ''
            }
            renderRow={(row) => (
              <CategoryTableRow
                category={row}
                onRequestDelete={(c) => {
                  setDeleteErrorMessage(null)
                  setPendingDelete({
                    id: c.id,
                    name: c.name?.trim() ? c.name : '—',
                    slug: c.slug?.trim() ?? '',
                  })
                }}
              />
            )}
            emptyMessage="No categories match your filters."
          />
        )}

        <footer className="border-t border-outline-variant/30 px-6 py-4">
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(next) => updateUrl({ page: next })}
            showingCount={showingCount}
            totalCount={totalCount}
            entityLabel="categories"
          />
        </footer>
      </section>
    </div>
  )
}
