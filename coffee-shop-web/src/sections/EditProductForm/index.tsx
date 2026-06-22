'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, Leaf, Plus, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type {
  Product,
  ProductImagePayload,
  ProductUpdatePayload,
} from '@/types/product'
import { PRODUCT_STATUS, ROAST_LEVEL } from '@/types/product'

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'
import { EMPTY_IMAGE } from '@/constants/images'
import { CATEGORY_QUERY_OPTIONS } from '@/constants/category'
import { ROUTES, dashboardProductEditPath } from '@/constants/routes'

import { useCategories } from '@/hooks/useCategory'
import { useUpdateProduct } from '@/hooks/useProduct'

import { uploadImageToImgBB } from '@/services/image'
import {
  editProductFormSchema,
  type EditProductFormValues,
} from '@/schemas/product'

import Breadcrumb from '@/components/Breadcrumb'
import { Input } from '@/components/Input'
import UploadImage from '@/components/UploadImage'
import UploadImageGallery from '@/components/UploadImage/Gallery'
import type { UploadImageGalleryItem } from '@/components/UploadImage/Gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/Select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import PublishIcon from '@/components/icon/PublishIcon'
import BrainIcon from '@/components/icon/BrainIcon'

import { getCategoryOptions } from '@/utils/common'
import {
  buildProductUpdateImageDiff,
  mapProductToEditFormValues,
  parseTastingNotesString,
  splitProductImagesForGallery,
} from '@/utils/product'

interface LocalImage {
  url: string
  name: string
  file: File
}

interface ImageValidationErrors {
  avatar: string
  gallery: string
}

const roastLevels: ROAST_LEVEL[] = [
  ROAST_LEVEL.LIGHT,
  ROAST_LEVEL.MEDIUM,
  ROAST_LEVEL.DARK,
]

const EDIT_FORM_DEFAULTS: EditProductFormValues = {
  categoryId: '',
  name: '',
  description: '',
  roastLevel: ROAST_LEVEL.LIGHT,
  isOrganic: true,
  isFairTrade: false,
  origin: '',
  processingMethod: '',
}

const getRoastIndex = (value: ROAST_LEVEL) => {
  const found = roastLevels.indexOf(value)
  return found === -1 ? 0 : found
}

interface EditProductFormProps {
  product: Product
  productId: string
}

const EditProductForm = ({ product, productId }: EditProductFormProps) => {
  const router = useRouter()
  const { mutate: updateMutate, isPending: isUpdatePending } =
    useUpdateProduct()
  const { categories, isLoading: isCategoryLoading } = useCategories(
    CATEGORY_QUERY_OPTIONS,
  )

  const [avatarImage, setAvatarImage] = useState<LocalImage | null>(null)
  const [serverPrimaryUrl, setServerPrimaryUrl] = useState<string | null>(null)
  const [existingGalleryItems, setExistingGalleryItems] = useState<
    UploadImageGalleryItem[]
  >([])
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [imageErrors, setImageErrors] = useState<ImageValidationErrors>({
    avatar: '',
    gallery: '',
  })
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isListedOnStorefront, setIsListedOnStorefront] = useState(false)
  const [tastingNotes, setTastingNotes] = useState<string[]>([])
  const [pendingNote, setPendingNote] = useState('')
  const categoryOptions = getCategoryOptions(categories)

  const {
    register,
    control,
    handleSubmit,
    clearErrors,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductFormSchema),
    defaultValues: EDIT_FORM_DEFAULTS,
    mode: 'onChange',
    reValidateMode: 'onBlur',
  })

  useEffect(() => {
    reset(mapProductToEditFormValues(product))
    setTastingNotes(parseTastingNotesString(product.tastingNotes))
    setIsListedOnStorefront(product.status === PRODUCT_STATUS.ACTIVE)
    const { primaryUrl, galleryItems } = splitProductImagesForGallery(product)
    setServerPrimaryUrl(primaryUrl)
    setExistingGalleryItems(galleryItems)
    setAvatarImage(null)
    setGalleryImages([])
    setImageErrors({ avatar: '', gallery: '' })
    setPendingNote('')
  }, [product, reset])

  const roastLevel = watch('roastLevel')
  const isSubmitting = isUpdatePending || isUploadingImages
  const initialNotes = parseTastingNotesString(product.tastingNotes)
  const initialListedOnStorefront = product.status === PRODUCT_STATUS.ACTIVE
  const { primaryUrl: initialPrimaryUrl, galleryItems: initialGalleryItems } =
    splitProductImagesForGallery(product)

  const hasStorefrontChanged =
    isListedOnStorefront !== initialListedOnStorefront
  const hasTastingNotesChanged =
    tastingNotes.join('|') !== initialNotes.join('|')
  const hasPrimaryImageChanged =
    Boolean(avatarImage) ||
    (serverPrimaryUrl ?? '') !== (initialPrimaryUrl ?? '')
  const hasGallerySelectionChanged = galleryImages.length > 0
  const hasGalleryItemsChanged =
    existingGalleryItems.length !== initialGalleryItems.length ||
    existingGalleryItems.some((item, index) => {
      const initial = initialGalleryItems[index]
      return item.id !== initial?.id || item.url !== initial?.url
    })

  const hasAnyChanges =
    isDirty ||
    hasStorefrontChanged ||
    hasTastingNotesChanged ||
    hasPrimaryImageChanged ||
    hasGallerySelectionChanged ||
    hasGalleryItemsChanged
  const submitDisabled = isSubmitting || !hasAnyChanges

  const handleResetChanges = () => {
    reset(mapProductToEditFormValues(product))
    setTastingNotes(parseTastingNotesString(product.tastingNotes))
    setIsListedOnStorefront(product.status === PRODUCT_STATUS.ACTIVE)
    const { primaryUrl, galleryItems } = splitProductImagesForGallery(product)
    setServerPrimaryUrl(primaryUrl)
    setExistingGalleryItems(galleryItems)
    setAvatarImage(null)
    setGalleryImages([])
    setImageErrors({ avatar: '', gallery: '' })
    setPendingNote('')
    toast.success(SUCCESS_MESSAGES.DRAFT_DISCARDED)
  }

  const addFilesAsImages = (files: File[] | FileList | null) => {
    if (!files) return
    const normalizedFiles = Array.isArray(files) ? files : Array.from(files)
    if (normalizedFiles.length === 0) return
    setGalleryImages((prev) => [...prev, ...normalizedFiles])
  }

  const handlePrimaryImageChange = (file: File | null) => {
    setImageErrors((prev) => ({ ...prev, avatar: '' }))
    if (!file) {
      setAvatarImage(null)
      setServerPrimaryUrl(null)
      return
    }
    setAvatarImage({
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    })
  }

  const handleGalleryImagesChange = (files: File[]) => {
    setImageErrors((prev) => ({ ...prev, gallery: '' }))
    addFilesAsImages(files)
  }

  const handleRemoveGalleryImage = (removeIndex: number) => {
    setGalleryImages((prev) => prev.filter((_, index) => index !== removeIndex))
  }

  const validateImageInputs = (): boolean => {
    const nextErrors: ImageValidationErrors = {
      avatar:
        avatarImage || serverPrimaryUrl?.trim()
          ? ''
          : ERROR_MESSAGES.PRODUCT_AVATAR_REQUIRED,
      gallery:
        galleryImages.length > 0 || existingGalleryItems.length > 0
          ? ''
          : ERROR_MESSAGES.PRODUCT_GALLERY_REQUIRED,
    }
    setImageErrors(nextErrors)
    return !nextErrors.avatar && !nextErrors.gallery
  }

  const handleAddNote = () => {
    const next = pendingNote.trim()
    if (!next) return
    if (tastingNotes.includes(next)) return
    setTastingNotes((prev) => [...prev, next])
    setPendingNote('')
  }

  const buildImagesPayload = ({
    avatarUrl,
    galleryUrls,
  }: {
    avatarUrl: string | null
    galleryUrls: string[]
  }): ProductImagePayload[] => {
    if (!avatarUrl && galleryUrls.length === 0) {
      return [
        {
          url: EMPTY_IMAGE,
          isPrimary: true,
          sortOrder: 0,
        },
      ]
    }

    const payload: ProductImagePayload[] = []

    if (avatarUrl) {
      payload.push({
        url: avatarUrl,
        isPrimary: true,
        sortOrder: 0,
      })
    }

    galleryUrls.forEach((url, index) => {
      payload.push({
        url,
        isPrimary: avatarUrl ? false : index === 0,
        sortOrder: avatarUrl ? index + 1 : index,
      })
    })

    return payload
  }

  const uploadSelectedImages = async () => {
    const existingGalleryUrls = existingGalleryItems.map((item) => item.url)
    const galleryUploads = await Promise.all(
      galleryImages.map((file) => uploadImageToImgBB(file)),
    )

    const failedGallery = galleryUploads.find((result) => !result.ok)
    if (failedGallery && !failedGallery.ok) {
      return { ok: false as const, error: failedGallery.error }
    }

    const newGalleryUrls = galleryUploads
      .filter((result): result is { ok: true; url: string } => result.ok)
      .map((result) => result.url)
    const galleryUrls = [...existingGalleryUrls, ...newGalleryUrls]

    if (avatarImage) {
      const uploadedAvatar = await uploadImageToImgBB(avatarImage.file)
      if (!uploadedAvatar.ok) {
        return { ok: false as const, error: uploadedAvatar.error }
      }
      return {
        ok: true as const,
        avatarUrl: uploadedAvatar.url,
        galleryUrls,
      }
    }

    if (serverPrimaryUrl?.trim()) {
      return {
        ok: true as const,
        avatarUrl: serverPrimaryUrl.trim(),
        galleryUrls,
      }
    }

    return {
      ok: true as const,
      avatarUrl: null,
      galleryUrls,
    }
  }

  const onSubmit = async (data: EditProductFormValues) => {
    if (!validateImageInputs()) return
    clearErrors()

    setIsUploadingImages(true)
    const uploadedImages = await uploadSelectedImages()
    if (!uploadedImages.ok) {
      toast.error(uploadedImages.error)
      setIsUploadingImages(false)
      return
    }

    const finalImages = buildImagesPayload({
      avatarUrl: uploadedImages.avatarUrl,
      galleryUrls: uploadedImages.galleryUrls,
    })

    const { addImages, removeImageIds, updateImages } =
      buildProductUpdateImageDiff(product.images, finalImages)

    const updatePayload: ProductUpdatePayload = {
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description.trim(),
      roastLevel: data.roastLevel,
      isOrganic: data.isOrganic,
      isFairTrade: data.isFairTrade,
      status: isListedOnStorefront
        ? PRODUCT_STATUS.ACTIVE
        : PRODUCT_STATUS.DRAFT,
      tastingNotes: tastingNotes.join(', '),
      origin: data.origin.trim(),
      processingMethod: data.processingMethod.trim(),
      addImages,
      removeImageIds,
      updateImages,
    }

    const finish = () => setIsUploadingImages(false)

    const id = product.id.trim()
    updateMutate(
      { id, body: updatePayload },
      {
        onSuccess: () => {
          toast.success(SUCCESS_MESSAGES.PRODUCT_UPDATED)
          finish()
          router.push(ROUTES.DASHBOARD_PRODUCTS)
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.NETWORK_ERROR,
          )
          finish()
        },
      },
    )
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
    { label: 'Products', href: ROUTES.DASHBOARD_PRODUCTS },
    {
      label: 'Edit Product',
      href:
        productId !== ''
          ? dashboardProductEditPath(productId)
          : ROUTES.DASHBOARD_PRODUCTS,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumb items={breadcrumbItems} />
          <div className="space-y-2">
            <h1 className="font-headline text-5xl leading-tight font-semibold tracking-tight text-foreground">
              Edit Product
            </h1>
            <p className="text-lg text-muted-foreground">
              Update this entry in your sensory collection.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="w-auto px-4 text-muted-foreground"
            disabled={isSubmitting}
            onClick={handleResetChanges}
          >
            Reset changes
          </Button>
          <Button
            type="button"
            className="w-auto px-8"
            disabled={submitDisabled}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            <PublishIcon />
            Save changes
          </Button>
        </div>
      </header>

      <form
        id="edit-product-form"
        className="flex flex-col gap-6"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <section className="grid gap-6 lg:grid-cols-[3fr_5fr]">
          <article className="rounded-4xl border border-outline-variant/30 bg-surface-container-low p-6">
            <h2 className="text-xl leading-none font-medium text-on-surface-variant">
              Visual Identity
            </h2>
            <div className="mt-5 space-y-4">
              <UploadImage
                name="avatar"
                type="primary"
                imageUrl={avatarImage?.url ?? serverPrimaryUrl ?? undefined}
                imageAlt={avatarImage?.name ?? 'Product image'}
                title="Main Hero Shot"
                helperText="PNG/JPG up to 5MB"
                buttonText="Browse"
                onChange={handlePrimaryImageChange}
                disabled={isSubmitting}
                className="min-h-68"
              />
              {Boolean(imageErrors.avatar) && (
                <p
                  role="alert"
                  className="-mt-1 text-xs font-medium text-destructive"
                >
                  {imageErrors.avatar}
                </p>
              )}

              <div className="space-y-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Gallery Assets
                </p>
                <UploadImageGallery
                  name="gallery"
                  files={galleryImages}
                  items={existingGalleryItems}
                  onAddImages={handleGalleryImagesChange}
                  onRemoveItem={(index, item) => {
                    if (item?.id) {
                      setExistingGalleryItems((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                      return
                    }
                    handleRemoveGalleryImage(index)
                  }}
                  disabled={isSubmitting}
                />
                {Boolean(imageErrors.gallery) && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {imageErrors.gallery}
                  </p>
                )}
              </div>
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-4xl border border-outline-variant/30 bg-surface-container-low p-6">
              <h2 className="text-xl leading-none font-medium text-on-surface-variant">
                General Information
              </h2>
              <div className="mt-5 grid gap-4">
                <Input
                  className="h-14"
                  label="Product Name"
                  placeholder="e.g. Ethiopian Yirgacheffe G1"
                  disabled={isSubmitting}
                  errorMessage={errors.name?.message}
                  {...register('name')}
                />
                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    placeholder="Describe the flavor profile, origin story, and unique characteristics..."
                    aria-invalid={errors.description ? true : undefined}
                    disabled={isSubmitting}
                    {...register('description')}
                  />
                  {Boolean(errors.description?.message) && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-destructive"
                    >
                      {errors.description?.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select
                        classNameTrigger="h-14"
                        label="Category"
                        placeholder="Select category"
                        options={categoryOptions}
                        selected={field.value}
                        onValueChange={field.onChange}
                        errorMessage={errors.categoryId?.message}
                        disabled={isCategoryLoading || isSubmitting}
                      />
                    )}
                  />
                  <div className="space-y-2">
                    <Label
                      htmlFor="product-status"
                      className="mb-0 text-xs font-semibold tracking-wider"
                    >
                      Active Status
                    </Label>
                    <div className="flex h-14 w-full mt-2 align-center items-center gap-3 rounded-xs px-3">
                      <Switch
                        id="product-status"
                        checked={isListedOnStorefront}
                        onCheckedChange={(checked) =>
                          setIsListedOnStorefront(checked === true)
                        }
                        disabled={isSubmitting}
                      />
                      <span className="text-sm leading-none text-on-surface-variant">
                        Listed on Storefront
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <article className="rounded-4xl border border-outline-variant/30 bg-surface-container-low p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-surface-container-high">
              <BrainIcon className="size-4" />
            </span>
            <h2 className="text-xl leading-tight font-medium text-on-surface-variant">
              Roast Characteristics
            </h2>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div className="space-y-3 p-2">
              <Label htmlFor="roast-level">Roast Level</Label>
              <Slider
                id="roast-level"
                min={0}
                max={2}
                step={1}
                value={[getRoastIndex(roastLevel)]}
                onValueChange={(values) => {
                  const nextIndex = Array.isArray(values)
                    ? (values[0] ?? 0)
                    : values
                  setValue(
                    'roastLevel',
                    roastLevels[nextIndex] ?? ROAST_LEVEL.LIGHT,
                    { shouldDirty: true },
                  )
                }}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Light</span>
                <Badge
                  variant="outline"
                  className="h-7 rounded-full border-primary/20 bg-primary/8 px-3 uppercase text-primary"
                >
                  {roastLevel}
                </Badge>
                <span>Dark</span>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                className="h-14"
                label="Origin"
                placeholder="e.g. Sidama Region, Ethiopia"
                disabled={isSubmitting}
                errorMessage={errors.origin?.message}
                {...register('origin')}
              />
              <Input
                className="h-14"
                label="Processing Method"
                placeholder="e.g. Natural / Washed"
                disabled={isSubmitting}
                errorMessage={errors.processingMethod?.message}
                {...register('processingMethod')}
              />
            </div>

            <div className="space-y-2">
              <Label className="tracking-wider uppercase">
                Sourcing Ethics
              </Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`inline-flex h-12 items-center gap-2 rounded-full border px-5 text-xs font-semibold uppercase tracking-wider ${
                    watch('isOrganic')
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/70 text-on-surface-variant'
                  }`}
                  onClick={() =>
                    setValue('isOrganic', !watch('isOrganic'), {
                      shouldDirty: true,
                    })
                  }
                >
                  <Leaf className="size-3.5" aria-hidden />
                  Organic
                </button>
                <button
                  type="button"
                  className={`inline-flex h-12 items-center gap-2 rounded-full border px-5 text-xs font-semibold uppercase tracking-wider ${
                    watch('isFairTrade')
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/70 text-on-surface-variant'
                  }`}
                  onClick={() =>
                    setValue('isFairTrade', !watch('isFairTrade'), {
                      shouldDirty: true,
                    })
                  }
                >
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Fair Trade
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <h2 className="text-xl font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Primary Tasting Notes
            </h2>
            <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                {Boolean(tastingNotes.length) &&
                  tastingNotes.map((note) => (
                    <Badge
                      key={note}
                      className="h-8 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
                    >
                      <span>{note}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${note}`}
                        className="ml-1 rounded-full p-0.5 text-primary-foreground/90 hover:bg-primary-foreground/20"
                        onClick={() =>
                          setTastingNotes((prev) =>
                            prev.filter((item) => item !== note),
                          )
                        }
                      >
                        <X className="size-3" aria-hidden />
                      </button>
                    </Badge>
                  ))}
              </div>
              <div className="mt-4 border-t border-outline-variant/20 pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex min-h-12 flex-1 items-center gap-3 rounded-full bg-transparent px-1 text-muted-foreground">
                    <span className="text-lg leading-none opacity-60">#</span>
                    <input
                      value={pendingNote}
                      onChange={(event) => setPendingNote(event.target.value)}
                      placeholder="Add a new flavor note (e.g. Caramel, Citrus)..."
                      className="w-full border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="button"
                    className="h-11.5 w-auto rounded-full bg-primary px-5 text-xs font-semibold tracking-wide uppercase"
                    onClick={handleAddNote}
                    disabled={isSubmitting || !pendingNote.length}
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Add note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </form>
    </div>
  )
}

export default EditProductForm
