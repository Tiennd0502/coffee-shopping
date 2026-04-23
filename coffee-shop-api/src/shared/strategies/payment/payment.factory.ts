import { PAYMENT_METHOD } from '@/shared/enums/order';

import type { PaymentStrategy } from './payment';
import { CodPaymentStrategy } from './cod';

export class PaymentStrategyFactory {
  static create(paymentMethod: PAYMENT_METHOD): PaymentStrategy {
    // TODO(v2): support multiple payment strategies in feature
    switch (paymentMethod) {
      case PAYMENT_METHOD.COD:
      case PAYMENT_METHOD.STRIPE:
      case PAYMENT_METHOD.PAYPAL:
      default:
        return new CodPaymentStrategy();
    }
  }
}
