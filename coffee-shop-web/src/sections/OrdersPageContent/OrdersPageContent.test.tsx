import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OrdersPageContent from '@/sections/OrdersPageContent'
import { PAYMENT_METHOD } from '@/types/checkout'
import { ORDER_STATUS, SHIPPING_STATUS, type Order } from '@/types/order'

const mockUseOrders = jest.fn()
const mockUseDeleteOrder = jest.fn()
const mockUseUpdateOrderStatus = jest.fn()
const mockUseUpdateOrderShippingStatus = jest.fn()

jest.mock('@/hooks/useOrder', () => ({
  useOrders: (...args: unknown[]) => mockUseOrders(...args),
  useDeleteOrder: (...args: unknown[]) => mockUseDeleteOrder(...args),
  useUpdateOrderStatus: (...args: unknown[]) =>
    mockUseUpdateOrderStatus(...args),
  useUpdateOrderShippingStatus: (...args: unknown[]) =>
    mockUseUpdateOrderShippingStatus(...args),
}))

jest.mock('@/hooks/useUrlState', () => ({
  useUrlState: () => ({
    state: {
      page: 1,
      search: '',
      limit: 10,
      status: null,
      shippingStatus: null,
    },
    update: jest.fn(),
  }),
}))

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

describe('OrdersPageContent', () => {
  const orderFixture: Order = {
    id: 'order-1',
    userId: 'user-1',
    orderNumber: 'OD-1001',
    status: ORDER_STATUS.PENDING,
    shippingStatus: SHIPPING_STATUS.PENDING,
    paymentStatus: ORDER_STATUS.PENDING,
    subTotal: 100,
    tax: 10,
    shippingFee: 5,
    totalAmount: 115,
    shippingMethodId: 'ship-1',
    shippingMethodName: 'Standard',
    paymentMethod: PAYMENT_METHOD.STRIPE,
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
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        productName: 'Arabica',
        productImage: '',
        variantId: 'variant-1',
        variantName: '250g',
        quantity: 1,
        unitPrice: 100,
        finalPrice: 100,
        subTotal: 100,
        discountAmount: 0,
      },
    ],
    createdAt: '2026-04-27T00:00:00.000Z',
    updatedAt: '2026-04-27T00:00:00.000Z',
  }

  beforeEach(() => {
    mockUseOrders.mockReturnValue({
      orders: [orderFixture],
      meta: { currentPage: 1, pageCount: 1, limit: 10, totalCount: 1 },
      isLoading: false,
      isError: false,
      errorMessage: null,
      refetch: jest.fn(),
    })
    mockUseDeleteOrder.mockReturnValue({ mutate: jest.fn(), isPending: false })
    mockUseUpdateOrderStatus.mockReturnValue({ mutate: jest.fn() })
    mockUseUpdateOrderShippingStatus.mockReturnValue({ mutate: jest.fn() })
  })

  it('opens order detail modal when view button clicked and closes it', async () => {
    const user = userEvent.setup()
    render(<OrdersPageContent />)

    await user.click(
      screen.getByRole('button', { name: /View order #OD-1001/i }),
    )

    expect(await screen.findByTestId('order-detail-modal')).toBeInTheDocument()
    expect(screen.getByText('Arabica x1')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Arabica' })).toBeInTheDocument()

    await user.click(
      screen.getAllByRole('button', { name: 'Close order details' })[0],
    )

    expect(screen.queryByText('Order Details')).not.toBeInTheDocument()
  })
})
