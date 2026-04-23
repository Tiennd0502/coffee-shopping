import { OrderResponseSchema, type OrderItemResponse, type OrderResponse } from './order.dto';
import type { Order } from './order.entity';
import type { OrderItem } from './order-item.entity';

const toItemResponse = (item: OrderItem): OrderItemResponse => ({
  id: item.id,
  variantId: item.variantId,
  productId: item.productId,
  quantity: item.quantity,
  unitPrice: Number(item.unitPrice),
  discountAmount: Number(item.discountAmount),
  finalPrice: Number(item.finalPrice),
  subTotal: Number(item.subTotal),
  productName: item.productName,
  productImage: item.productImage,
  variantName: item.variantName,
});

export const toResponse = (order: Order): OrderResponse =>
  OrderResponseSchema.parse({
    id: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    shippingMethodId: order.shippingMethodId,
    paymentMethod: order.paymentMethod,
    status: order.status,
    shippingStatus: order.shippingStatus,
    paymentStatus: order.paymentStatus,
    subTotal: Number(order.subTotal),
    tax: Number(order.tax),
    shippingFee: Number(order.shippingFee),
    totalAmount: Number(order.totalAmount),
    shippingMethodName: order.shippingMethodName,
    addressSnapshot: {
      firstName: order.addressSnapshot.firstName ?? '',
      lastName: order.addressSnapshot.lastName ?? '',
      phoneNumber: order.addressSnapshot.phoneNumber ?? '',
      addressLine: order.addressSnapshot.addressLine ?? '',
      city: order.addressSnapshot.city ?? '',
      district: order.addressSnapshot.district ?? null,
      ward: order.addressSnapshot.ward ?? null,
      postalCode: order.addressSnapshot.postalCode ?? null,
    },
    note: order.note,
    items: (order.items ?? []).map(toItemResponse),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  });
