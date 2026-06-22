'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/styles'

import CameraIcon from '@/components/icon/CameraIcon'
import ImageIcon from '../icon/ImageIcon'

type UploadImageType = 'primary' | 'secondary'

interface UploadImageProps {
  name: string
  imageUrl?: string
  imageAlt?: string
  title: string
  helperText?: string
  buttonText?: string
  onChange: (file: File | null) => void
  onMultipleChange?: (files: File[]) => void
  type?: UploadImageType
  multiple?: boolean
  disabled?: boolean
  className?: string
}

const UploadImage = ({
  name,
  imageUrl,
  imageAlt = 'Uploaded image',
  title,
  helperText,
  buttonText = 'Browse',
  onChange,
  onMultipleChange,
  type = 'primary',
  multiple = false,
  disabled = false,
  className,
}: UploadImageProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (multiple) {
      onMultipleChange?.(files)
      onChange(files[0] ?? null)
      event.currentTarget.value = ''
      return
    }

    onChange(files[0] ?? null)
    event.currentTarget.value = ''
  }

  const isSecondary = type === 'secondary'
  const hasImage = Boolean(imageUrl)
  const handleRemove = () => onChange(null)
  const inputName = multiple && !name.endsWith('[]') ? `${name}[]` : name

  const renderHelperText = (textClassName: string) => {
    return Boolean(helperText) ? (
      <p className={textClassName}>{helperText}</p>
    ) : null
  }

  return (
    <>
      {isSecondary ? (
        hasImage ? (
          <div
            className={cn(
              'box-border grid h-[104px] w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-4xl border border-outline-variant/70 bg-card px-4 py-4',
              className,
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative size-18 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={imageUrl ?? ''}
                  alt={imageAlt}
                  objectFit="cover"
                  className="h-full w-full object-cover"
                  width={72}
                  height={72}
                />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xl leading-tight font-semibold text-foreground">
                  {title}
                </p>
                {/* {renderHelperText('truncate text-lg text-muted-foreground')} */}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              aria-label="Remove image"
              disabled={disabled}
              onClick={handleRemove}
            >
              <Trash2 className="size-5" aria-hidden />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'box-border grid h-[104px] w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-4xl border border-dashed border-outline-variant/70 bg-surface-container px-4 py-4',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              className,
            )}
            role="button"
            onClick={disabled ? undefined : handleClick}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex size-18 shrink-0 items-center justify-center rounded-md bg-border/40">
                <ImageIcon className="size-4 text-primary/70" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xl leading-tight font-semibold text-foreground">
                  {title}
                </p>
                {/* {renderHelperText('truncate text-lg text-muted-foreground')} */}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Upload image"
              disabled={disabled}
            >
              <Upload className="size-5 text-foreground" aria-hidden />
            </Button>
          </div>
        )
      ) : hasImage ? (
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-4xl bg-card',
            className,
          )}
        >
          <Image
            src={imageUrl ?? ''}
            alt={imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
            aria-label="Remove image"
            disabled={disabled}
            onClick={handleRemove}
          >
            <Trash2 className="size-6" aria-hidden />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'w-full rounded-4xl border border-dashed border-outline-variant/90 bg-surface-container px-6 py-8 text-center',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            className,
          )}
          role="button"
          onClick={disabled ? undefined : handleClick}
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-border opacity-80">
            <CameraIcon className="size-6 text-primary" aria-hidden />
          </div>
          <p className="mt-4 text-md font-semibold">{title}</p>
          {renderHelperText('mt-2 text-xs text-muted-foreground')}
          <Button
            type="button"
            size="xs"
            variant="outline"
            className="mt-4 h-7.5 w-auto rounded-full border-primary px-5 text-[10px] text-primary uppercase"
            disabled={disabled}
          >
            {buttonText}
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        name={inputName}
        className="hidden"
        multiple={multiple}
        accept="image/*"
        onChange={handleInputChange}
      />
    </>
  )
}

export default UploadImage
