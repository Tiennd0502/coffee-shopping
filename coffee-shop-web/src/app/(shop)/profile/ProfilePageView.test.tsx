import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProfilePageView } from '@/app/(shop)/profile/ProfilePageView'
import { PAYMENT_METHOD } from '@/types/checkout'
import { ORDER_STATUS, SHIPPING_STATUS, type Order } from '@/types/order'

const mockUseAuth = jest.fn()
const mockUseClerkUser = jest.fn()
const mockUseOrders = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}))

jest.mock('@clerk/nextjs', () => ({
  useUser: (...args: unknown[]) => mockUseClerkUser(...args),
}))

jest.mock('@/hooks/useOrder', () => ({
  useOrders: (...args: unknown[]) => mockUseOrders(...args),
}))

describe('ProfilePageView order history', () => {
  const refetch = jest.fn()

  const orderFixture: Order = {
    id: 'order-1',
    userId: 'user-1',
    orderNumber: 'OD-1001',
    status: ORDER_STATUS.COMPLETED,
    shippingStatus: SHIPPING_STATUS.DELIVERED,
    paymentStatus: ORDER_STATUS.COMPLETED,
    subTotal: 100000,
    tax: 10000,
    shippingFee: 15000,
    totalAmount: 125000,
    shippingMethodId: 'ship-1',
    shippingMethodName: 'Standard',
    paymentMethod: PAYMENT_METHOD.COD,
    user: {
      id: 'user-1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      avatarUrl: null,
    },
    addressSnapshot: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '0123456789',
      addressLine: '123 Main',
      district: 'District 1',
      ward: 'Ward 1',
      city: 'HCM',
      postalCode: '700000',
    },
    items: [],
    createdAt: '2026-04-27T00:00:00.000Z',
    updatedAt: '2026-04-27T00:00:00.000Z',
  }

  beforeEach(() => {
    refetch.mockReset()
    mockUseAuth.mockReturnValue({
      user: null,
      error: null,
      isSignedIn: true,
      isAuthLoaded: true,
    })
    mockUseClerkUser.mockReturnValue({
      user: null,
      isLoaded: true,
    })
    mockUseOrders.mockReturnValue({
      orders: [orderFixture],
      meta: null,
      isLoading: false,
      isError: false,
      errorMessage: null,
      refetch,
    })
  })

  it('renders loading state in order table', () => {
    mockUseOrders.mockReturnValue({
      orders: [],
      meta: null,
      isLoading: true,
      isError: false,
      errorMessage: null,
      refetch,
    })

    render(<ProfilePageView />)

    expect(screen.getByText('Loading orders')).toBeInTheDocument()
  })

  it('renders error state and retries', async () => {
    const user = userEvent.setup()
    mockUseOrders.mockReturnValue({
      orders: [],
      meta: null,
      isLoading: false,
      isError: true,
      errorMessage: 'Load failed',
      refetch,
    })

    render(<ProfilePageView />)

    expect(screen.getByText('Load failed')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when no orders', () => {
    mockUseOrders.mockReturnValue({
      orders: [],
      meta: null,
      isLoading: false,
      isError: false,
      errorMessage: null,
      refetch,
    })

    render(<ProfilePageView />)

    expect(screen.getByText('No orders found.')).toBeInTheDocument()
  })

  it('opens and closes order detail modal from table action', async () => {
    const user = userEvent.setup()
    render(<ProfilePageView />)

    await user.click(
      screen.getByRole('button', { name: /View order #OD-1001/i }),
    )

    expect(await screen.findByTestId('order-detail-modal')).toBeInTheDocument()

    await user.click(
      screen.getAllByRole('button', { name: 'Close order details' })[0],
    )

    expect(screen.queryByTestId('order-detail-modal')).not.toBeInTheDocument()
  })
})
