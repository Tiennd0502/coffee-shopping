import { OrderResponseSchema, type OrderItemResponse, type OrderResponse } from './order.dto';
import type { Order } from './order.entity';
import type { OrderItem } from './order-item.entity';

export class OrderMapper {
  static toResponse(order: Order): OrderResponse {
    return OrderResponseSchema.parse({
      id: order.id,
      userId: order.userId,
      user: order.user
        ? {
            id: order.user.id,
            email: order.user.email,
            firstName: order.user.firstName,
            lastName: order.user.lastName,
            phoneNumber: order.user.phoneNumber ?? null,
            avatarUrl: order.user.avatarUrl ?? null,
          }
        : null,
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
      items: (order.items ?? []).map(OrderMapper.toItemResponse),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      deletedAt: order.deletedAt?.toISOString() ?? null,
    });
  }

  private static toItemResponse(item: OrderItem): OrderItemResponse {
    return {
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
    };
  }
}
