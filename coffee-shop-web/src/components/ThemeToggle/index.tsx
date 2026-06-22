'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/styles'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export const ThemeToggle = ({
  className,
  showLabel = false,
}: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const next: 'light' | 'dark' = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(className)}
        disabled
        aria-label="Toggle color theme"
      >
        <span className="size-4 shrink-0" aria-hidden />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('gap-2', showLabel && 'w-auto px-3', className)}
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun className="size-4 shrink-0" aria-hidden />
      ) : (
        <Moon className="size-4 shrink-0" aria-hidden />
      )}
      {showLabel && (
        <span className="hidden text-sm sm:inline">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </Button>
  )
}
