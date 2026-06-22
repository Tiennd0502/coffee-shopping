'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

export const ThemeProvider = ({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = true,
  storageKey = 'node-brew-theme',
  ...props
}: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
