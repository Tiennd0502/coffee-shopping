import { render, screen } from '@testing-library/react'

import { Spinner } from '@/components/ui/spinner'

describe('Spinner', () => {
  it('renders with default status semantics', () => {
    render(<Spinner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading')).toHaveClass('sr-only')
  })

  it('applies semantic size classes', () => {
    const { rerender } = render(<Spinner size="sm" />)
    expect(screen.getByTestId('spinner-icon')).toHaveClass('size-4')

    rerender(<Spinner size="md" />)
    expect(screen.getByTestId('spinner-icon')).toHaveClass('size-5')

    rerender(<Spinner size="lg" />)
    expect(screen.getByTestId('spinner-icon')).toHaveClass('size-6')
  })

  it('supports decorative mode for inline usage', () => {
    render(<Spinner decorative data-testid="decorative-spinner" />)

    const icon = screen.getByTestId('decorative-spinner')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
