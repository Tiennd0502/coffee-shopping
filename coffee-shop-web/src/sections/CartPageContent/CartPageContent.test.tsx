import { fireEvent, render, screen, within } from '@testing-library/react'
import type React from 'react'
import { useRouter } from 'next/navigation'

import CartPageContent from '@/sections/CartPageContent'
import { useCartStore } from '@/store/useCartStore'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/store/useCartStore', () => ({
  useCartStore: jest.fn(),
}))

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

const mockUseRouter = jest.mocked(useRouter)
const mockUseCart = jest.mocked(useCartStore)

const baseUseCartResult = {
  items: [
    {
      id: 'line-1',
      productId: 'product-1',
      name: 'Ethiopian Yirgacheffe',
      meta: 'Light Roast • Floral & Citrus Notes',
      imageUrl: '/images/empty-image.webp',
      unitPrice: 24,
      quantity: 1,
      maxQuantity: 20,
    },
    {
      id: 'line-2',
      productId: 'product-2',
      name: 'Precision Gooseneck Kettle',
      meta: 'Matte Black • Variable Temp Control',
      imageUrl: '/images/empty-image.webp',
      unitPrice: 145,
      quantity: 1,
      maxQuantity: 10,
    },
  ],
  totals: {
    subtotal: 169,
    shipping: null,
    tax: 0,
    total: 169,
  },
  hasHydrated: true,
  isLoading: false,
  isError: false,
  errorMessage: null,
  addItem: jest.fn(),
  changeQuantity: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
  refetch: jest.fn(),
}

describe('CartPageContent', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>)
    mockUseCart.mockReturnValue(baseUseCartResult)
  })

  it('renders heading and line items in success state', () => {
    render(<CartPageContent />)

    expect(
      screen.getByRole('heading', { name: 'Your Sensory Cart' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument()
    expect(screen.getByText('Precision Gooseneck Kettle')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Order Summary' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('$169.00')).toHaveLength(2)
  })

  it('shows loading state while cart is hydrating', () => {
    mockUseCart.mockReturnValue({
      ...baseUseCartResult,
      isLoading: true,
    })

    render(<CartPageContent />)
    expect(screen.getByTestId('cart-loading')).toBeInTheDocument()
  })

  it('shows error state and allows retry', () => {
    mockUseCart.mockReturnValue({
      ...baseUseCartResult,
      isError: true,
      errorMessage: 'Storage parse error',
    })

    render(<CartPageContent />)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(screen.getByText('Storage parse error')).toBeInTheDocument()
    expect(baseUseCartResult.refetch).toHaveBeenCalled()
  })

  it('shows empty state when there are no items', () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>)
    mockUseCart.mockReturnValue({
      ...baseUseCartResult,
      items: [],
      totals: {
        subtotal: 0,
        shipping: null,
        tax: 0,
        total: 0,
      },
    })

    render(<CartPageContent />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue Shopping' }))

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith('/')
  })

  it('navigates to checkout when clicking proceed to checkout', () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>)

    render(<CartPageContent />)
    fireEvent.click(screen.getByRole('button', { name: 'Proceed to Checkout' }))

    expect(push).toHaveBeenCalledWith('/checkout')
  })

  it('opens remove dialog and confirms removing item', () => {
    render(<CartPageContent />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Ethiopian Yirgacheffe' }),
    )
    const modal = screen.getByTestId('modal-confirm-remove-cart-item')
    expect(within(modal).getByText('Remove item?')).toBeInTheDocument()
    expect(within(modal).getByText('Ethiopian Yirgacheffe')).toBeInTheDocument()

    fireEvent.click(within(modal).getByRole('button', { name: 'Remove' }))
    expect(baseUseCartResult.removeItem).toHaveBeenCalledWith('line-1')
  })
})
