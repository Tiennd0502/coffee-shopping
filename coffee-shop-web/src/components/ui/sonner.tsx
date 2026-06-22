'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const toasterStyle = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--success-bg': 'var(--success)',
  '--error-bg': 'var(--error)',
  '--info-bg': 'var(--info)',
  '--warning-bg': 'var(--warning)',
} as CSSProperties

const iconClass = 'size-4 shrink-0 text-[currentColor]'

export const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const theme: ToasterProps['theme'] = mounted
    ? resolvedTheme === 'dark'
      ? 'dark'
      : 'light'
    : 'system'

  return (
    <Sonner
      theme={theme}
      richColors
      className="toaster group"
      style={toasterStyle}
      icons={{
        success: <CircleCheckIcon className={iconClass} aria-hidden />,
        info: <InfoIcon className={iconClass} aria-hidden />,
        warning: <TriangleAlertIcon className={iconClass} aria-hidden />,
        error: <OctagonXIcon className={iconClass} aria-hidden />,
        loading: (
          <Loader2Icon className={`${iconClass} animate-spin`} aria-hidden />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: 'group shadow-lg',
        },
      }}
      {...props}
    />
  )
}
