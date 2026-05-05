import type { Order } from '@/modules/order/order.entity';
import { PAYMENT_STATUS } from '@/shared/enums/order';

import type { PaymentResult, PaymentStrategy } from './payment';

export class PaypalPaymentStrategy implements PaymentStrategy {
  async initiate(_order: Order): Promise<PaymentResult> {
    void _order;
    return { paymentStatus: PAYMENT_STATUS.PAID };
  }
}
