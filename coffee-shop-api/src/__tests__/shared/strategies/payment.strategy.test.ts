import AppDataSource from '@/config/database';
import { Order } from '@/modules/order/order.entity';
import { PAYMENT_STATUS } from '@/shared/enums/order';
import { PaypalPaymentStrategy } from '@/shared/strategies/payment/paypal';
import { StripePaymentStrategy } from '@/shared/strategies/payment/stripe';

const mockOrderRepo = { save: jest.fn() };

const makeOrder = (paymentStatus: PAYMENT_STATUS = PAYMENT_STATUS.UNPAID): Order =>
  ({
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    paymentStatus,
  }) as Order;

describe('Payment strategies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) =>
        entity === Order ? (mockOrderRepo as never) : ({} as never),
      );
  });

  it('StripePaymentStrategy sets paymentStatus to PAID and saves order', async () => {
    const order = makeOrder();

    await new StripePaymentStrategy().initiate(order);

    expect(order.paymentStatus).toBe(PAYMENT_STATUS.PAID);
    expect(mockOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ paymentStatus: PAYMENT_STATUS.PAID }),
    );
  });

  it('PaypalPaymentStrategy sets paymentStatus to PAID and saves order', async () => {
    const order = makeOrder();

    await new PaypalPaymentStrategy().initiate(order);

    expect(order.paymentStatus).toBe(PAYMENT_STATUS.PAID);
    expect(mockOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ paymentStatus: PAYMENT_STATUS.PAID }),
    );
  });
});
