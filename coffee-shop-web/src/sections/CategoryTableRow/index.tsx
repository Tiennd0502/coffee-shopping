'use client'

import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Button, buttonVariants } from '@/components/ui/button'
import { dashboardCategoryEditRoute } from '@/constants/routes'
import type { Category } from '@/types/category'
import { cn } from '@/utils/styles'

function formatTs(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export interface CategoryTableRowProps {
  category: Category
  onRequestDelete?: (category: Category) => void
}

export function CategoryTableRow({
  category,
  onRequestDelete,
}: CategoryTableRowProps) {
  const isDeleted = Boolean(category.deletedAt)

  return (
    <>
      <td className="min-w-0 px-6 py-4 align-middle">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-center text-foreground">
              {category.name || '—'}
            </p>
          </div>
        </div>
      </td>
      <td className="min-w-0 px-6 py-4 align-middle">
        <code
          title={category.slug?.trim() ? category.slug : undefined}
          className="block max-w-full truncate rounded-md bg-muted px-2 py-0.5 text-sm text-center text-muted-foreground"
        >
          {category.slug || '—'}
        </code>
      </td>
      <td className="px-6 py-4 align-middle text-center text-sm text-muted-foreground truncate">
        {formatTs(category.createdAt)}
      </td>
      <td className="px-6 py-4 align-middle text-center text-sm text-muted-foreground truncate">
        {formatTs(category.updatedAt)}
      </td>
      <td className="min-w-0 px-6 py-4 align-middle">
        <div className="flex justify-end gap-1">
          {!isDeleted && category.id ? (
            <Link
              href={dashboardCategoryEditRoute(category.id)}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
                'inline-flex',
              )}
              aria-label={`Edit ${category.name}`}
            >
              <Pencil className="size-4" aria-hidden />
            </Link>
          ) : (
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label={`Edit ${category.name}`}
              disabled
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
          )}
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={`Remove ${category.name}`}
            disabled={isDeleted || !category.id}
            onClick={() => {
              if (!category.id || isDeleted) return
              onRequestDelete?.(category)
            }}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </td>
    </>
  )
}
