'use client'

import { useEffect, useState } from 'react'

import UploadImage from '@/components/UploadImage'

export interface UploadImageGalleryItem {
  id?: string
  url: string
  name: string
}

interface UploadImageGalleryProps {
  name: string
  files: File[]
  items?: UploadImageGalleryItem[]
  maxLength?: number
  disabled?: boolean
  onAddImages: (files: File[]) => void
  onRemoveItem: (index: number, item?: UploadImageGalleryItem) => void
  itemHelperText?: string
  uploadTitle?: string
  uploadHelperText?: string
  uploadButtonText?: string
}

const UploadImageGallery = ({
  name,
  files,
  items = [],
  maxLength = 6,
  disabled = false,
  onAddImages,
  onRemoveItem,
  itemHelperText = 'Secondary perspective',
  uploadTitle = 'Gallery Image',
  uploadHelperText = 'Secondary perspective',
  uploadButtonText = 'Upload',
}: UploadImageGalleryProps) => {
  const [previewItems, setPreviewItems] = useState<UploadImageGalleryItem[]>([])
  const totalImages = items.length + files.length
  const remainingSlots = Math.max(0, maxLength - totalImages)
  const isUploaderDisabled = disabled || remainingSlots === 0

  useEffect(() => {
    const nextPreviewItems = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }))

    setPreviewItems(nextPreviewItems)

    return () => {
      nextPreviewItems.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [files])

  return (
    <div className="space-y-3">
      {items.map((image, index) => (
        <UploadImage
          key={image.id ?? `${image.url}-${index}`}
          name={`${name}-existing-item-${index}`}
          type="secondary"
          imageUrl={image.url}
          imageAlt={image.name}
          title={image.name}
          helperText={itemHelperText}
          onChange={(file) => {
            if (file !== null) return
            onRemoveItem(index, image)
          }}
          disabled={disabled}
        />
      ))}
      {previewItems.map((image, index) => (
        <UploadImage
          key={`${image.url}-${index}`}
          name={`${name}-item-${index}`}
          type="secondary"
          imageUrl={image.url}
          imageAlt={image.name}
          title={image.name}
          helperText={itemHelperText}
          onChange={(file) => {
            if (file !== null) return
            onRemoveItem(index)
          }}
          disabled={disabled}
        />
      ))}
      <UploadImage
        name={name}
        type="secondary"
        title={uploadTitle}
        helperText={uploadHelperText}
        buttonText={uploadButtonText}
        multiple
        onChange={() => undefined}
        onMultipleChange={(incomingFiles) => {
          onAddImages(incomingFiles.slice(0, remainingSlots))
        }}
        disabled={isUploaderDisabled}
      />
    </div>
  )
}

export default UploadImageGallery
