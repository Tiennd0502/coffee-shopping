import type { Order } from '@/modules/order/order.entity';

export interface PaymentStrategy {
  initiate(order: Order): Promise<void>;
}
