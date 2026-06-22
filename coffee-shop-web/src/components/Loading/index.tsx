'use client'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/utils/styles'

interface LoadingProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Loading({
  label = 'Loading',
  size = 'md',
  className,
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center px-6 py-12 text-muted-foreground',
        className,
      )}
    >
      <Spinner size={size} label={label} className="text-primary" />
    </div>
  )
}
