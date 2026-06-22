import { render, screen } from '@testing-library/react'

import { Separator } from '@/components/ui/separator'

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    render(<Separator />)
    const el = screen.getByRole('separator')
    expect(el).toHaveClass('bg-border')
  })

  it('renders labeled horizontal layout when text is provided', () => {
    render(<Separator text="OR CONTINUE WITH" />)
    expect(screen.getByText('OR CONTINUE WITH')).toBeInTheDocument()
    const root = document.querySelector('[data-slot="separator"]')
    expect(root?.tagName).toBe('DIV')
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(1)
    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-label',
      'OR CONTINUE WITH',
    )
  })

  it('ignores blank or whitespace-only text', () => {
    const { rerender } = render(<Separator text="" />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(1)

    rerender(<Separator text="   " />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(1)
  })

  it('trims surrounding whitespace from text', () => {
    render(<Separator text="  HELLO  " />)
    expect(screen.getByText('HELLO')).toBeInTheDocument()
  })

  it('renders labeled vertical layout with rotated text when orientation is vertical', () => {
    render(<Separator orientation="vertical" text="SKIP" />)
    const label = screen.getByText('SKIP')
    expect(label).toBeInTheDocument()
    expect(label).toHaveClass('-rotate-90')
    expect(label).toHaveClass('whitespace-nowrap')
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    expect(separator).toHaveAttribute('aria-label', 'SKIP')
  })

  it('renders a wrapper root that contains the separator primitive', () => {
    render(<Separator />)
    const root = document.querySelector('[data-slot="separator"]')
    expect(root).toBeInTheDocument()
    expect(root?.tagName).toBe('DIV')
    expect(root?.querySelector('[role="separator"]')).toBeInTheDocument()
  })
})
