import type { Order } from '@/modules/order/order.entity';
import { PAYMENT_STATUS } from '@repo/types';

import type { PaymentResult, PaymentStrategy } from './payment';

export class CodPaymentStrategy implements PaymentStrategy {
  async initiate(_order: Order): Promise<PaymentResult> {
    void _order;
    return { paymentStatus: PAYMENT_STATUS.UNPAID };
  }
}
