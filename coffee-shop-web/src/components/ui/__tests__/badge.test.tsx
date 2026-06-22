import { render, screen } from '@testing-library/react'

import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders text and data-slot', () => {
    render(<Badge>New</Badge>)

    const badge = screen.getByText('New')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  it('applies base classes', () => {
    render(<Badge>Core</Badge>)

    const badge = screen.getByText('Core')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('h-6')
    expect(badge).toHaveClass('rounded-full')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('font-semibold')
  })

  it('applies default variant by default', () => {
    render(<Badge>Default</Badge>)

    const badge = screen.getByText('Default')
    expect(badge).toHaveClass('bg-primary')
    expect(badge).toHaveClass('text-on-primary')
    expect(badge).toHaveClass('border-transparent')
  })

  it('applies secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>)

    const badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-surface-container-high')
    expect(badge).toHaveClass('text-on-surface-variant')
  })

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>)

    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('border-outline-variant')
    expect(badge).toHaveClass('bg-surface-container-low')
    expect(badge).toHaveClass('text-on-surface-variant')
  })

  it('applies destructive variant classes', () => {
    render(<Badge variant="destructive">Error</Badge>)

    const badge = screen.getByText('Error')
    expect(badge).toHaveClass('bg-destructive')
    expect(badge).toHaveClass('text-on-error')
  })

  it('merges custom className', () => {
    render(<Badge className="uppercase">Merge</Badge>)

    const badge = screen.getByText('Merge')
    expect(badge).toHaveClass('uppercase')
    expect(badge).toHaveClass('bg-primary')
  })

  it('supports aria attributes through prop spreading', () => {
    render(<Badge aria-label="Status badge">Live</Badge>)

    expect(screen.getByLabelText('Status badge')).toHaveTextContent('Live')
  })
})
