import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProfilePageView } from '@/app/(shop)/profile/ProfilePageView';
import { PAYMENT_METHOD } from '@repo/types';
import { type Order } from '@/types/order';
import { ORDER_STATUS, SHIPPING_STATUS, PAYMENT_STATUS } from '@repo/types';

const mockUseAuth = jest.fn();
const mockUseClerkUser = jest.fn();
const mockUseOrders = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

jest.mock('@clerk/nextjs', () => ({
  useUser: (...args: unknown[]) => mockUseClerkUser(...args),
}));

jest.mock('@/hooks/useOrder', () => ({
  useOrders: (...args: unknown[]) => mockUseOrders(...args),
}));

describe('ProfilePageView order history', () => {
  const refetch = jest.fn();

  const orders: Order[] = [
    {
      id: 'order-1',
      userId: 'user-1',
      orderNumber: 'OD-1001',
      status: ORDER_STATUS.COMPLETED,
      shippingStatus: SHIPPING_STATUS.DELIVERED,
      paymentStatus: PAYMENT_STATUS.PAID,
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
        avatarUrl: '',
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
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    refetch.mockReset();
    mockUseAuth.mockReturnValue({
      user: null,
      error: null,
      isSignedIn: true,
      isAuthLoaded: true,
    });
    mockUseClerkUser.mockReturnValue({
      user: null,
      isLoaded: true,
    });
    mockUseOrders.mockReturnValue({
      data: { data: orders, meta: null },
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    });
  });

  it('renders error state and retries', async () => {
    const user = userEvent.setup();
    mockUseOrders.mockReturnValue({
      data: { data: [], meta: null },
      isLoading: false,
      isError: true,
      error: { message: 'Load failed' },
      refetch,
    });

    render(<ProfilePageView />);

    expect(screen.getByText('Load failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no orders', () => {
    mockUseOrders.mockReturnValue({
      data: { data: [], meta: null },
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    });

    render(<ProfilePageView />);

    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('opens and closes order detail modal from table action', async () => {
    const user = userEvent.setup();
    render(<ProfilePageView />);

    await user.click(screen.getByRole('button', { name: /View order #OD-1001/i }));

    expect(await screen.findByTestId('order-detail-modal')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Close order details' })[0]);

    expect(screen.queryByTestId('order-detail-modal')).not.toBeInTheDocument();
  });
});
