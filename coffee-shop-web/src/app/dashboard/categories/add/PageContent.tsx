'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Types
import { type CategoryPayload } from '@/types/category'

// Constants
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { createCategoryFormSchema } from '@/schemas/category'

// Hooks
import { useCreateCategory } from '@/hooks/useCategory'

// Components
import Breadcrumb from '@/components/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/Input'

const PageContent = () => {
  const { mutate, isPending } = useCreateCategory()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CategoryPayload>({
    resolver: zodResolver(createCategoryFormSchema),
    defaultValues: { name: '' },
  })

  const onSubmit = (data: CategoryPayload) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(SUCCESS_MESSAGES.CATEGORY_CREATED)
        reset({ name: '' })
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
        setError('name', { type: 'server', message })
      },
    })
  }

  return (
    <form
      id="create-user-form"
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
              { label: 'Add', href: ROUTES.DASHBOARD_CATEGORIES_ADD },
            ]}
          />
          <div className="space-y-2">
            <h1 className="font-headline text-4xl leading-tight font-semibold tracking-tight text-foreground">
              Add Category
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            className="rounded-full px-8"
            disabled={isPending}
            loading={isPending}
          >
            Create category
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-card p-6 md:p-8">
        <Input
          id="category-name"
          label="Category name"
          type="text"
          autoComplete="off"
          placeholder="Enter category name"
          disabled={isPending}
          errorMessage={errors.name?.message}
          className="mt-2"
          {...register('name', {
            onChange: () => clearErrors('name'),
          })}
        />
      </section>
    </form>
  )
}

export default PageContent
