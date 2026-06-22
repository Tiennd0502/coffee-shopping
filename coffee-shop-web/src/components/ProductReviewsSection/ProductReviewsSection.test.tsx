import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'

import { ProductReviewsSection } from '@/components/ProductReviewsSection'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    <img alt={alt ?? ''} src={src} {...rest} />
  ),
}))

const toastInfo = jest.fn()
jest.mock('sonner', () => ({
  toast: {
    info: (...args: unknown[]) => toastInfo(...args),
  },
}))

describe('ProductReviewsSection', () => {
  beforeEach(() => {
    toastInfo.mockClear()
  })

  it('renders heading and mock review quotes', () => {
    render(<ProductReviewsSection />)

    expect(
      screen.getByRole('heading', { name: /Customer Impressions/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Bright acidity/i)).toBeInTheDocument()
  })

  it('shows toast when Write a Review is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductReviewsSection />)

    await user.click(screen.getByRole('button', { name: /Write a Review/i }))
    expect(toastInfo).toHaveBeenCalled()
  })

  it('exposes data-testid', () => {
    render(<ProductReviewsSection />)
    expect(screen.getByTestId('product-reviews-section')).toBeInTheDocument()
  })
})
