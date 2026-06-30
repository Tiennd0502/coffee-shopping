import type { Order } from '@/modules/order/order.entity';
import type { PAYMENT_STATUS } from '@repo/types';

export type PaymentResult = {
  paymentStatus: PAYMENT_STATUS;
};

export interface PaymentStrategy {
  initiate(order: Order): Promise<PaymentResult>;
}
