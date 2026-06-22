import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/utils/common'

export interface ProductDeletePreviewProps {
  name: string
  imageUrl: string | null
  price: number
}

export function ProductDeletePreview({
  name,
  imageUrl,
  price,
}: ProductDeletePreviewProps) {
  const displayName = name.trim() || 'Untitled product'
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-muted/60 p-4">
      <div className="size-16 shrink-0 overflow-hidden rounded-full bg-muted">
        <Avatar className="size-16 rounded-full">
          <AvatarImage
            src={imageUrl ?? ''}
            alt={displayName}
            className="rounded-full object-cover"
          />
          <AvatarFallback className="rounded-full text-sm font-semibold truncate">
            {displayName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="min-w-0 text-left">
        <p className="truncate font-semibold text-foreground">{displayName}</p>
        <p className="text-sm text-muted-foreground">
          {formatPrice(price, 'en-US', 'USD')}
        </p>
      </div>
    </div>
  )
}
