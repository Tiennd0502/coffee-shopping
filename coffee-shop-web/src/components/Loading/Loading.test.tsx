import { render, screen } from '@testing-library/react'

import Loading from '@/components/Loading'

describe('Loading', () => {
  it('renders centered status spinner by default', () => {
    render(<Loading />)

    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveClass('inline-flex')
    expect(status.parentElement).toHaveClass('w-full')
    expect(status.parentElement).toHaveClass('h-full')
    expect(screen.getByText('Loading')).toHaveClass('sr-only')
  })

  it('passes custom label and size to spinner', () => {
    render(<Loading label="Loading categories" size="lg" />)

    expect(screen.getByText('Loading categories')).toHaveClass('sr-only')
    expect(screen.getByTestId('spinner-icon')).toHaveClass('size-6')
  })
})
