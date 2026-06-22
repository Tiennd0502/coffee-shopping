import * as React from 'react'

import { cn } from '@/utils/styles'

type TextTag = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type TextProps<T extends TextTag = 'p'> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

const textBaseClassName = 'text-on-surface'

const textTagClassMap: Record<TextTag, string> = {
  p: 'text-base leading-relaxed',
  span: 'text-base leading-normal',
  h1: 'text-5xl font-semibold leading-tight',
  h2: 'text-4xl font-semibold leading-tight',
  h3: 'text-3xl font-semibold leading-snug',
  h4: 'text-2xl font-semibold leading-snug',
  h5: 'text-xl font-semibold leading-snug',
  h6: 'text-sm font-semibold leading-snug',
}

export const Text = <T extends TextTag = 'p'>({
  as,
  className,
  children,
  ...props
}: TextProps<T>) => {
  const tag: TextTag = as ?? 'p'

  return React.createElement(
    tag,
    {
      ...props,
      className: cn(textBaseClassName, textTagClassMap[tag], className),
      'data-slot': 'text',
    },
    children,
  )
}
