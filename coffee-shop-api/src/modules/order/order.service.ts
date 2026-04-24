import { In, type Repository } from 'typeorm';

import AppDataSource from '@/config/database';
import { createModuleLogger } from '@/config/logger';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import { ShippingMethod } from '@/modules/shipping/shipping-method.entity';
import { UserAddress } from '@/modules/user/user-address.entity';
import { User } from '@/modules/user/user.entity';
import { ORDER_CONSTANTS } from '@/shared/constants/order';
import { DISCOUNT_TYPE } from '@/shared/enums/product';
import { SHIPPING_METHOD_STATUS } from '@/shared/enums/order';
import { USER_STATUS } from '@/shared/enums/user';
import { BadRequestError, NotFoundError } from '@/shared/errors/app';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { DiscountStrategyFactory } from '@/shared/strategies/discount/discount.factory';
import { PaymentStrategyFactory } from '@/shared/strategies/payment/payment.factory';

import type {
  CreateOrderAddressInput,
  CreateOrderInput,
  UpdateOrderStatusInput,
} from './order.dto';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { assertValidOrderStatusTransition } from './order-state';

const log = createModuleLogger('OrderService');

const userRepo = (): Repository<User> => AppDataSource.getRepository(User);
const shippingRepo = (): Repository<ShippingMethod> => AppDataSource.getRepository(ShippingMethod);
const variantRepo = (): Repository<ProductVariant> => AppDataSource.getRepository(ProductVariant);
const orderRepo = (): Repository<Order> => AppDataSource.getRepository(Order);

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const toAddressSnapshot = (address: UserAddress | CreateOrderAddressInput) => ({
  firstName: address.firstName,
  lastName: address.lastName,
  phoneNumber: address.phoneNumber,
  addressLine: address.addressLine,
  city: address.city,
  district: address.district?.trim() || undefined,
  ward: address.ward?.trim() || undefined,
  postalCode: address.postalCode?.trim() || undefined,
});

export const createOrder = async (input: CreateOrderInput, userId: string): Promise<Order> => {
  log.info('Placing order', { userId, itemCount: input.items.length });

  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new BadRequestError(ERROR_MESSAGES.ORDER.USER_INACTIVE);
  }

  const shippingMethod = await shippingRepo().findOne({
    where: { id: input.shippingMethodId, status: SHIPPING_METHOD_STATUS.ACTIVE },
  });
  if (!shippingMethod) {
    throw new NotFoundError('Shipping method');
  }

  const variantIds = input.items.map((i) => i.variantId);
  if (new Set(variantIds).size !== variantIds.length) {
    throw new BadRequestError(ERROR_MESSAGES.ORDER.DUPLICATE_VARIANT);
  }

  const variants = await variantRepo().find({
    where: { id: In(variantIds) },
    relations: ['product', 'product.images'],
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  for (const item of input.items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      throw new NotFoundError('Product variant');
    }
    if (variant.quantity < item.quantity) {
      throw new BadRequestError(
        ERROR_MESSAGES.ORDER.INSUFFICIENT_STOCK(variant.sku, variant.quantity),
      );
    }
  }

  let subTotal = 0;
  const itemData = input.items.map((item) => {
    const variant = variantMap.get(item.variantId)!;
    const strategy = DiscountStrategyFactory.create(variant.discountType ?? DISCOUNT_TYPE.FIXED);
    const unitPrice = Number(variant.price);
    const discountValue = variant.discountValue !== null ? Number(variant.discountValue) : null;
    const discountAmount = strategy.calculate(unitPrice, discountValue);
    const finalPrice = Math.max(0, unitPrice - discountAmount);
    const itemSubTotal = finalPrice * item.quantity;
    const primaryImage = variant.product.images?.find((img) => img.isPrimary)?.url ?? null;

    subTotal += itemSubTotal;

    return {
      variantId: item.variantId,
      productId: variant.product.id,
      quantity: item.quantity,
      unitPrice,
      discountAmount,
      finalPrice,
      subTotal: itemSubTotal,
      productName: variant.product.name,
      productImage: primaryImage,
      variantName: variant.name,
    };
  });

  const tax = subTotal * ORDER_CONSTANTS.TAX_RATE;
  const shippingFee = Number(shippingMethod.price);
  const totalAmount = subTotal + tax + shippingFee;

  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  let savedOrderId: string;

  try {
    let addressSnapshot: ReturnType<typeof toAddressSnapshot>;

    const addressRepo = qr.manager.getRepository(UserAddress);
    const addressCount = await addressRepo.count({ where: { userId } });

    if (addressCount === 0) {
      const saved = await addressRepo.save(
        addressRepo.create({
          userId,
          ...input.shippingAddress,
          district: input.shippingAddress.district?.trim() || '',
          ward: input.shippingAddress.ward?.trim() || '',
          postalCode: input.shippingAddress.postalCode?.trim() || '',
          isDefault: true,
        }),
      );
      addressSnapshot = toAddressSnapshot(saved);
    } else {
      addressSnapshot = toAddressSnapshot(input.shippingAddress);
    }

    const order = qr.manager.getRepository(Order).create({
      userId,
      shippingMethodId: input.shippingMethodId,
      orderNumber: generateOrderNumber(),
      paymentMethod: input.paymentMethod,
      subTotal,
      tax,
      shippingFee,
      totalAmount,
      shippingMethodName: shippingMethod.name,
      addressSnapshot,
      note: input.note ?? null,
      updatedBy: null,
      items: itemData.map((d) => qr.manager.getRepository(OrderItem).create(d)),
    });

    const saved = await qr.manager.save(order);
    savedOrderId = saved.id;

    for (const item of input.items) {
      await qr.manager
        .getRepository(ProductVariant)
        .decrement({ id: item.variantId }, 'quantity', item.quantity);
    }

    await qr.commitTransaction();
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }

  const fullOrder = await orderRepo().findOne({
    where: { id: savedOrderId },
    relations: ['items'],
  });
  if (!fullOrder) throw new NotFoundError('Order');

  await PaymentStrategyFactory.create(input.paymentMethod).initiate(fullOrder);

  log.info('Order placed', { orderId: fullOrder.id, orderNumber: fullOrder.orderNumber, userId });

  return fullOrder;
};

interface UpdateOrderStatusOptions {
  orderId: string;
  input: UpdateOrderStatusInput;
}

export const updateOrderStatus = async ({
  orderId,
  input,
}: UpdateOrderStatusOptions): Promise<Order> => {
  log.info('Updating order status', { orderId, newStatus: input.status });

  const order = await orderRepo().findOne({
    where: { id: orderId },
    relations: ['items'],
  });
  if (!order) throw new NotFoundError('Order');

  assertValidOrderStatusTransition(order.status, input.status);

  order.status = input.status;
  const updated = await orderRepo().save(order);

  log.info('Order status updated', { orderId, newStatus: updated.status });

  return updated;
};
