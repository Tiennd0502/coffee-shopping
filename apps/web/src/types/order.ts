import { type AddressSnapshot } from './checkout';
import type {
  User,
  ORDER_STATUS,
  SHIPPING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
} from '@repo/types';

export interface OrderItemPayload {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
}
export interface OrderItem extends OrderItemPayload {
  id: string;
  productName: string;
  productImage: string;
  variantName: string;
  finalPrice: number;
  subTotal: number;
  discountAmount: number;
}

export interface OrderPayload {
  shippingMethodId: string;
  paymentMethod: PAYMENT_METHOD;
  shippingAddress: AddressSnapshot;
  note?: string;
  items: OrderItemPayload[];
}

export interface Order extends Omit<OrderPayload, 'shippingAddress'> {
  id: string;
  userId: string;
  orderNumber: string;
  status: ORDER_STATUS;
  shippingStatus: SHIPPING_STATUS;
  paymentStatus: PAYMENT_STATUS;
  subTotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  shippingMethodName: string;
  addressSnapshot: AddressSnapshot;
  items: OrderItem[];
  user: User;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
