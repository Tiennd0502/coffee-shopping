import type { Order } from '@/modules/order/order.entity';

import type { PaymentStrategy } from './payment';

export class CodPaymentStrategy implements PaymentStrategy {
  async initiate(order: Order): Promise<void> {
    void order;
    // COD requires no external payment call
  }
}
