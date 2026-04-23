import { PAYMENT_METHOD } from '@/shared/enums/order';

import type { PaymentStrategy } from './payment';
import { CodPaymentStrategy } from './cod';
import { PaypalPaymentStrategy } from './paypal';
import { StripePaymentStrategy } from './stripe';

export class PaymentStrategyFactory {
  static create(paymentMethod: PAYMENT_METHOD): PaymentStrategy {
    switch (paymentMethod) {
      case PAYMENT_METHOD.STRIPE:
        return new StripePaymentStrategy();
      case PAYMENT_METHOD.PAYPAL:
        return new PaypalPaymentStrategy();
      case PAYMENT_METHOD.COD:
      default:
        return new CodPaymentStrategy();
    }
  }
}
