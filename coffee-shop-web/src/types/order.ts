import { type AddressSnapshot, type PaymentMethod } from './checkout'
import { type User } from './user'

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SHIPPING_STATUS {
  PENDING = 'PENDING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export interface OrderItemPayload {
  productId: string
  variantId: string
  quantity: number
  unitPrice: number
}
export interface OrderItem extends OrderItemPayload {
  id: string
  productName: string
  productImage: string
  variantName: string
  finalPrice: number
  subTotal: number
  discountAmount: number
}

export interface OrderPayload {
  shippingMethodId: string
  paymentMethod: PaymentMethod
  shippingAddress: AddressSnapshot
  note?: string
  items: OrderItemPayload[]
}

export interface Order extends Omit<OrderPayload, 'shippingAddress'> {
  id: string
  userId: string
  orderNumber: string
  status: ORDER_STATUS
  shippingStatus: SHIPPING_STATUS
  paymentStatus: ORDER_STATUS
  subTotal: number
  tax: number
  shippingFee: number
  totalAmount: number
  shippingMethodName: string
  addressSnapshot: AddressSnapshot
  items: OrderItem[]
  user: User
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
