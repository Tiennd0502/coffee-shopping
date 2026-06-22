'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Download, Plus, Printer } from 'lucide-react'
import { toast } from 'sonner'

import AlertDialog from '@/components/AlertDialog'
import Breadcrumb from '@/components/Breadcrumb'
import { PaginationBar } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import Table from '@/components/Table'
import { Button, buttonVariants } from '@/components/ui/button'
import { SEARCH_URL_DEBOUNCE_MS } from '@/constants/common'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'
import {
  PRODUCT_STATUS_OPTIONS,
  PRODUCTS_TABLE_COLUMNS,
} from '@/constants/product'
import { ROUTES } from '@/constants/routes'
import { CATEGORY_QUERY_OPTIONS } from '@/constants/category'
import { useCategories } from '@/hooks/useCategory'
import { useDeleteProduct, useProducts } from '@/hooks/useProduct'
import { ProductDeletePreview } from '@/sections/ProductDeletePreview'
import { ProductTableRow } from '@/sections/ProductTableRow'
import { getProductListPrice, getProductPrimaryImageUrl } from '@/utils/product'
import { getCategoryOptions } from '@/utils/common'
import { productUrlSchema } from '@/utils/url'
import { cn } from '@/utils/styles'
import { useUrlState } from '@/hooks/useUrlState'
import { Select } from '@/components/Select'
import { PRODUCT_STATUS, type Product } from '@/types/product'
import Loading from '@/components/Loading'

const ALL_CATEGORIES_VALUE = 'all-categories'

export const PageContent = () => {
  const { state, update: updateUrl } = useUrlState(productUrlSchema)
  const { page, search, limit, categoryId, status } = state
  const searchDebounceTimerRef = useRef<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  )
  const { mutate: deleteProductMutate, isPending: isDeletePending } =
    useDeleteProduct()

  const { categories, isLoading: isCategoryLoading } = useCategories(
    CATEGORY_QUERY_OPTIONS,
  )
  const activeCategories = categories.filter((category) => !category.deletedAt)

  const categoryOptions = [
    { value: ALL_CATEGORIES_VALUE, label: 'All categories' },
    ...getCategoryOptions(activeCategories),
  ]
  const normalizedCategoryId =
    categoryId &&
    categoryOptions.some((option) => String(option.value) === categoryId)
      ? categoryId
      : null

  const normalizedStatus =
    status &&
    PRODUCT_STATUS_OPTIONS.some((option) => option.value === status) &&
    status !== PRODUCT_STATUS_OPTIONS[0].value
      ? status
      : null

  const { products, meta, isLoading, isError, errorMessage, refetch } =
    useProducts({
      page,
      limit,
      search: search.trim(),
      categoryId: normalizedCategoryId ?? undefined,
      status: normalizedStatus ?? undefined,
    })

  const totalPages = Math.max(1, meta?.pageCount ?? 1)
  const totalCount = meta?.totalCount ?? products.length
  const showingCount = products.length

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextSearch = event.target.value

    if (searchDebounceTimerRef.current !== null) {
      window.clearTimeout(searchDebounceTimerRef.current)
    }

    searchDebounceTimerRef.current = window.setTimeout(() => {
      if (nextSearch === search) return
      updateUrl({ search: nextSearch, page: 1 })
    }, SEARCH_URL_DEBOUNCE_MS)
  }

  const handleCategoryChange = (value: unknown) => {
    if (typeof value !== 'string') return
    updateUrl({
      categoryId: value === ALL_CATEGORIES_VALUE ? null : value,
      page: 1,
    })
  }
  const handleProductStatusChange = (value: unknown) => {
    if (typeof value !== 'string') return
    updateUrl({
      status: value === PRODUCT_STATUS_OPTIONS[0].value ? null : value,
      page: 1,
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <AlertDialog
        data-testid="modal-confirm-delete-product"
        open={pendingDelete !== null}
        isLoading={isDeletePending}
        errorMessage={deleteErrorMessage}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setDeleteErrorMessage(null)
          }
        }}
        title="Delete Product?"
        description={
          <p>
            Are you sure you want to delete <b>{pendingDelete?.name}</b>? This
            action cannot be undone.
          </p>
        }
        textAction="Delete"
        onClickAction={() => {
          const id = pendingDelete?.id
          if (!id) return
          setDeleteErrorMessage(null)
          deleteProductMutate(id, {
            onSuccess: () => {
              toast.success(SUCCESS_MESSAGES.PRODUCT_DELETED)
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
      >
        {pendingDelete && (
          <ProductDeletePreview
            name={pendingDelete.name}
            imageUrl={getProductPrimaryImageUrl(pendingDelete)}
            price={getProductListPrice(pendingDelete)}
          />
        )}
      </AlertDialog>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: ROUTES.DASHBOARD },
              { label: 'Products', href: ROUTES.DASHBOARD_PRODUCTS },
            ]}
          />
          <div className="space-y-2">
            <h1 className="text-5xl leading-tight font-bold tracking-tight text-foreground">
              Products
            </h1>
            <p className="text-lg text-muted-foreground">
              Oversee your catalog and inventory
            </p>
          </div>
        </div>
        <div className="flex w-full justify-end sm:w-auto">
          <Link
            href={ROUTES.DASHBOARD_PRODUCTS_ADD}
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              'inline-flex w-full gap-2 px-8 sm:w-auto',
            )}
          >
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card">
        <div className="flex min-w-0 flex-col gap-3 border-b border-outline-variant/30 p-4 md:flex-row md:flex-wrap md:items-center md:gap-3 lg:justify-between">
          <SearchInput
            value={search}
            onChange={handleQueryChange}
            placeholder="Filter by product name..."
            aria-label="Filter products by name"
            containerClassName="h-12 bg-surface-container-high w-full md:w-auto md:min-w-0 md:max-w-md md:flex-1"
          />
          <div className="flex w-full min-w-0 gap-4 md:w-72 md:max-w-80 md:shrink-0">
            <Select
              classNameTrigger="h-12 rounded-full"
              placeholder="All categories"
              options={categoryOptions}
              selected={normalizedCategoryId ?? ALL_CATEGORIES_VALUE}
              disabled={isCategoryLoading}
              onValueChange={handleCategoryChange}
            />
          </div>
          <div className="flex w-full min-w-0 gap-4 md:w-52 md:max-w-56 md:shrink-0">
            <Select
              classNameTrigger="h-12 rounded-full"
              placeholder="All statuses"
              options={PRODUCT_STATUS_OPTIONS}
              selected={normalizedStatus ?? PRODUCT_STATUS_OPTIONS[0].value}
              onValueChange={handleProductStatusChange}
            />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3">
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Export products list"
              className="size-11"
            >
              <Download className="size-4" aria-hidden />
            </Button>
            <Button
              disabled
              variant="outline"
              size="icon"
              aria-label="Print products list"
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
            columns={PRODUCTS_TABLE_COLUMNS}
            data={products}
            getRowKey={(product, index) => product.id ?? `product-${index}`}
            resolveRowClassName={(product) =>
              product.status === PRODUCT_STATUS.ARCHIVED
                ? 'border-b border-border bg-muted-foreground/20'
                : ''
            }
            renderRow={(product) => (
              <ProductTableRow
                product={product}
                categoryOptions={categoryOptions}
                onRequestDelete={(p) => setPendingDelete(p)}
              />
            )}
            emptyMessage="No products found."
          />
        )}

        <footer className="border-t border-outline-variant/30 px-6 py-4">
          <PaginationBar
            currentPage={Math.min(page, totalPages)}
            totalPages={totalPages}
            onPageChange={(next) => updateUrl({ page: next })}
            showingCount={showingCount}
            totalCount={totalCount}
            entityLabel="products"
          />
        </footer>
      </section>
    </div>
  )
}
