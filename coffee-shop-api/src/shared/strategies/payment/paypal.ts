import AppDataSource from '@/config/database';
import { Order } from '@/modules/order/order.entity';
import { PAYMENT_STATUS } from '@/shared/enums/order';

import type { PaymentStrategy } from './payment';

export class PaypalPaymentStrategy implements PaymentStrategy {
  async initiate(order: Order): Promise<void> {
    order.paymentStatus = PAYMENT_STATUS.PAID;
    await AppDataSource.getRepository(Order).save(order);
  }
}
