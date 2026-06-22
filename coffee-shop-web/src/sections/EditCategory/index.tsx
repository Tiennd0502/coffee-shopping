'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import Breadcrumb from '@/components/Breadcrumb'
import Loading from '@/components/Loading'
import { Button } from '@/components/ui/button'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'
import { ROUTES, dashboardCategoryEditRoute } from '@/constants/routes'
import { useCategoryById, useUpdateCategory } from '@/hooks/useCategory'
import { createCategoryFormSchema } from '@/schemas/category'
import type { CategoryPayload } from '@/types/category'
import { Input } from '@/components/Input'

const EditCategory = () => {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const rawId = params?.id
  const categoryId = Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? '')

  const { category, isLoading, isError, errorMessage } =
    useCategoryById(categoryId)
  const { mutate, isPending } = useUpdateCategory()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<CategoryPayload>({
    resolver: zodResolver(createCategoryFormSchema),
    defaultValues: { name: category?.name ?? '' },
  })

  useEffect(() => {
    if (!category) return
    reset({ name: category.name ?? '' })
  }, [category, reset])

  const onSubmit = (data: CategoryPayload) => {
    const trimmedId = categoryId.trim()
    if (!trimmedId) return
    mutate(
      { id: trimmedId, body: data },
      {
        onSuccess: () => {
          toast.success(SUCCESS_MESSAGES.CATEGORY_UPDATED)
          router.push(ROUTES.DASHBOARD_CATEGORIES)
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.NETWORK_ERROR
          setError('name', { type: 'server', message })
        },
      },
    )
  }

  const trimmedId = categoryId.trim()
  const editHref = trimmedId
    ? dashboardCategoryEditRoute(trimmedId)
    : ROUTES.DASHBOARD_CATEGORIES

  if (!trimmedId) {
    return (
      <div className="flex flex-col gap-4 px-6 py-12">
        <p className="text-muted-foreground">Missing category id.</p>
        <Link
          href={ROUTES.DASHBOARD_CATEGORIES}
          className="w-fit text-primary underline"
        >
          Back to categories
        </Link>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 px-6 py-12">
        <p className="text-destructive">
          {errorMessage ?? ERROR_MESSAGES.NETWORK_ERROR}
        </p>
        <Link
          href={ROUTES.DASHBOARD_CATEGORIES}
          className="w-fit text-primary underline"
        >
          Back to categories
        </Link>
      </div>
    )
  }

  const formDisabled = isPending || isLoading
  const submitDisabled = formDisabled || !isDirty

  return (
    <form
      id="edit-category-form"
      className="flex flex-col gap-6"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: ROUTES.DASHBOARD },
              { label: 'Categories', href: ROUTES.DASHBOARD_CATEGORIES },
              { label: 'Edit', href: editHref },
            ]}
          />
          <div className="space-y-2">
            <h1 className="font-headline text-4xl leading-tight font-semibold tracking-tight text-foreground">
              Edit Category
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            className="rounded-full px-8"
            disabled={submitDisabled}
            loading={isPending}
          >
            Save changes
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card p-6 md:p-8">
        {isLoading ? (
          <Loading label="Loading category" className="px-0 py-0" />
        ) : (
          <Input
            id="category-name"
            label="Category name"
            type="text"
            autoComplete="off"
            placeholder="Enter category name"
            disabled={formDisabled}
            errorMessage={errors.name?.message}
            className="mt-2"
            {...register('name', {
              onChange: () => clearErrors('name'),
            })}
          />
        )}
      </section>
    </form>
  )
}

export default EditCategory
