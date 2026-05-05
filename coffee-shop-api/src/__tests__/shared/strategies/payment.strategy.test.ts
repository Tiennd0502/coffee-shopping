import { Order } from '@/modules/order/order.entity';
import { PAYMENT_STATUS } from '@/shared/enums/order';
import { CodPaymentStrategy } from '@/shared/strategies/payment/cod';
import { PaypalPaymentStrategy } from '@/shared/strategies/payment/paypal';
import { StripePaymentStrategy } from '@/shared/strategies/payment/stripe';

const makeOrder = (paymentStatus: PAYMENT_STATUS = PAYMENT_STATUS.UNPAID): Order =>
  ({
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    paymentStatus,
  }) as Order;

describe('Payment strategies', () => {
  it('StripePaymentStrategy returns PAID without mutating order', async () => {
    const order = makeOrder();

    const result = await new StripePaymentStrategy().initiate(order);

    expect(result.paymentStatus).toBe(PAYMENT_STATUS.PAID);
    expect(order.paymentStatus).toBe(PAYMENT_STATUS.UNPAID);
  });

  it('PaypalPaymentStrategy returns PAID without mutating order', async () => {
    const order = makeOrder();

    const result = await new PaypalPaymentStrategy().initiate(order);

    expect(result.paymentStatus).toBe(PAYMENT_STATUS.PAID);
    expect(order.paymentStatus).toBe(PAYMENT_STATUS.UNPAID);
  });

  it('CodPaymentStrategy returns UNPAID', async () => {
    const order = makeOrder();

    const result = await new CodPaymentStrategy().initiate(order);

    expect(result.paymentStatus).toBe(PAYMENT_STATUS.UNPAID);
  });
});
