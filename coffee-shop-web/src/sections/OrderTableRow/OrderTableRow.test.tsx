import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PAYMENT_METHOD } from '@/types/checkout'
import { ORDER_STATUS, SHIPPING_STATUS, type Order } from '@/types/order'

import { OrderTableRow } from './index'

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord-1',
    userId: 'user-1',
    orderNumber: 'SB-9281',
    status: ORDER_STATUS.PENDING,
    shippingStatus: SHIPPING_STATUS.SHIPPING,
    paymentStatus: ORDER_STATUS.PENDING,
    subTotal: 100,
    tax: 10,
    shippingFee: 5,
    totalAmount: 115,
    shippingMethodId: 'sm-1',
    shippingMethodName: 'Standard',
    paymentMethod: PAYMENT_METHOD.STRIPE,
    user: {
      id: 'user-1',
      email: 'elena@example.com',
      firstName: 'Elena',
      lastName: 'Vance',
      name: 'Elena Vance',
      avatarUrl: null,
    },
    addressSnapshot: {
      firstName: 'Elena',
      lastName: 'Vance',
      phoneNumber: '0123',
      addressLine: '1 Main',
      city: 'HCMC',
      district: 'D1',
      ward: 'W1',
      postalCode: '700000',
    },
    items: [],
    deletedAt: null,
    createdAt: '2023-10-24T12:00:00.000Z',
    updatedAt: '2023-10-24T12:00:00.000Z',
    ...overrides,
  }
}

describe('OrderTableRow', () => {
  it('renders order id, customer, and distinct status badges', () => {
    const order = makeOrder()
    render(
      <table>
        <tbody>
          <tr>
            <OrderTableRow order={order} />
          </tr>
        </tbody>
      </table>,
    )

    expect(screen.getByText('#SB-9281')).toBeInTheDocument()
    expect(screen.getByText('Elena Vance')).toBeInTheDocument()
    const row = screen.getByRole('row')
    expect(within(row).getByText('Pending')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /View order #SB-9281/i }),
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: /Delete order #SB-9281/i }),
    ).toBeEnabled()
  })

  it('calls onRequestView with current order when view clicked', async () => {
    const user = userEvent.setup()
    const order = makeOrder()
    const onRequestView = jest.fn()

    render(
      <table>
        <tbody>
          <tr>
            <OrderTableRow order={order} onRequestView={onRequestView} />
          </tr>
        </tbody>
      </table>,
    )

    await user.click(
      screen.getByRole('button', { name: /View order #SB-9281/i }),
    )

    expect(onRequestView).toHaveBeenCalledTimes(1)
    expect(onRequestView).toHaveBeenCalledWith(order)
  })

  it('calls onRequestDelete with current order when delete clicked', async () => {
    const user = userEvent.setup()
    const order = makeOrder()
    const onRequestDelete = jest.fn()

    render(
      <table>
        <tbody>
          <tr>
            <OrderTableRow order={order} onRequestDelete={onRequestDelete} />
          </tr>
        </tbody>
      </table>,
    )

    await user.click(
      screen.getByRole('button', { name: /Delete order #SB-9281/i }),
    )

    expect(onRequestDelete).toHaveBeenCalledTimes(1)
    expect(onRequestDelete).toHaveBeenCalledWith(order)
  })

  it('disables delete action when isDeleteDisabled is true', () => {
    const order = makeOrder()
    render(
      <table>
        <tbody>
          <tr>
            <OrderTableRow order={order} isDeleteDisabled />
          </tr>
        </tbody>
      </table>,
    )

    expect(
      screen.getByRole('button', { name: /Delete order #SB-9281/i }),
    ).toBeDisabled()
  })

  it('locks status and delete actions for deleted order but still allows view', async () => {
    const user = userEvent.setup()
    const order = makeOrder({ deletedAt: '2026-01-02T00:00:00.000Z' })
    const onRequestView = jest.fn()
    const onRequestDelete = jest.fn()

    render(
      <table>
        <tbody>
          <tr>
            <OrderTableRow
              order={order}
              onRequestView={onRequestView}
              onRequestDelete={onRequestDelete}
            />
          </tr>
        </tbody>
      </table>,
    )

    expect(
      screen.getByRole('button', { name: /Change order status for #SB-9281/i }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /Delete order #SB-9281/i }),
    ).toBeDisabled()

    await user.click(
      screen.getByRole('button', { name: /View order #SB-9281/i }),
    )

    expect(onRequestView).toHaveBeenCalledTimes(1)
    expect(onRequestView).toHaveBeenCalledWith(order)
    expect(onRequestDelete).not.toHaveBeenCalled()
  })

  it('sets title on truncated order id display', () => {
    const longNumber = `SB-${'9'.repeat(40)}`
    const order = makeOrder({ orderNumber: longNumber })

    render(
      <table>
        <tbody>
          <tr>
            <OrderTableRow order={order} />
          </tr>
        </tbody>
      </table>,
    )

    const idCell = screen.getByText(`#${longNumber}`)
    expect(idCell).toHaveAttribute('title', `#${longNumber}`)
  })
})
