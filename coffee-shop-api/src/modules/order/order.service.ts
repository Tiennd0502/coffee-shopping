import { type DataSource, type EntityManager } from 'typeorm';

import { createModuleLogger } from '@/config/logger';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import type { ProductVariantRepository } from '@/modules/product/product-variant.repository';
import type { UserRepository } from '@/modules/user/user.repository';
import { UserAddress } from '@/modules/user/user-address.entity';
import { ORDER_CONSTANTS } from '@/shared/constants/order';
import { DISCOUNT_TYPE } from '@/shared/enums/product';
import { ORDER_STATUS } from '@/shared/enums/order';
import { USER_STATUS } from '@/shared/enums/user';
import { BadRequestError, ErrorItem, ForbiddenError, NotFoundError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { BaseService } from '@/shared/services/base.service';
import { DiscountStrategyFactory } from '@/shared/strategies/discount/discount.factory';
import { PaymentStrategyFactory } from '@/shared/strategies/payment/payment.factory';
import type { PaginatedResponse } from '@/shared/types/response';

import type {
  CreateOrderAddressInput,
  CreateOrderInput,
  ListOrdersQuery,
  UpdateOrderStatusInput,
  UpdateShippingStatusInput,
} from './order.dto';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { assertShippingTransition, assertValidOrderStatusTransition } from './order-state';
import type { OrderRepository } from './order.repository';
import type { ShippingMethodRepository } from './shipping-method.repository';

const log = createModuleLogger('OrderService');

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

export interface OrderServiceDeps {
  orderRepo: OrderRepository;
  userRepo: UserRepository;
  shippingRepo: ShippingMethodRepository;
  variantRepo: ProductVariantRepository;
  dataSource: DataSource;
}

export class OrderService extends BaseService<Order, OrderRepository> {
  private readonly userRepo: UserRepository;
  private readonly shippingRepo: ShippingMethodRepository;
  private readonly variantRepo: ProductVariantRepository;

  constructor(dependencies: OrderServiceDeps) {
    super(dependencies.orderRepo, dependencies.dataSource);
    this.userRepo = dependencies.userRepo;
    this.shippingRepo = dependencies.shippingRepo;
    this.variantRepo = dependencies.variantRepo;
  }

  async create(input: CreateOrderInput, userId: string): Promise<Order> {
    log.info('Placing order', { userId, itemCount: input.items.length });

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new BadRequestError(ERROR_MESSAGES.ORDER.USER_INACTIVE);
    }

    const shippingMethod = await this.shippingRepo.findActiveById(input.shippingMethodId);
    if (!shippingMethod) {
      throw new NotFoundError('Shipping method');
    }

    const variantIds = input.items.map((item) => item.variantId);
    if (new Set(variantIds).size !== variantIds.length) {
      throw new BadRequestError(ERROR_MESSAGES.ORDER.DUPLICATE_VARIANT);
    }

    const variants = await this.variantRepo.findByIds(variantIds, ['product', 'product.images']);
    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

    const stockErrors: ErrorItem[] = [];

    for (const [index, item] of input.items.entries()) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        throw new NotFoundError('Product variant');
      }
      if (variant.quantity < item.quantity) {
        const insufficientStockMsg = ERROR_MESSAGES.ORDER.INSUFFICIENT_STOCK(
          variant.sku,
          variant.quantity,
        );
        stockErrors.push({
          errCode: ErrorCode.BAD_REQUEST,
          field: `items[${index}]`,
          message: insufficientStockMsg,
          description: insufficientStockMsg,
        });
      }
    }

    if (stockErrors.length > 0) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_REQUEST, stockErrors);
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
    const savedOrderId = await this.createOrderWithTransaction({
      input,
      userId,
      variantIds,
      shippingMethodName: shippingMethod.name,
      itemData,
      subTotal,
      tax,
      shippingFee,
      totalAmount,
    });

    const fullOrder = await this.repository.findByIdWithRelations(savedOrderId, ['items']);
    if (!fullOrder) {
      throw new NotFoundError('Order');
    }

    log.info('Order placed', {
      orderId: fullOrder.id,
      orderNumber: fullOrder.orderNumber,
      userId,
      paymentStatus: fullOrder.paymentStatus,
    });
    return fullOrder;
  }

  async updateStatus(orderId: string, input: UpdateOrderStatusInput): Promise<Order> {
    log.info('Updating order status', { orderId, newStatus: input.status });

    const order = await this.requireOrderWithRelations(orderId, ['items']);
    assertValidOrderStatusTransition(order.status, input.status);

    if (input.status === ORDER_STATUS.CANCELLED) {
      return this.cancelOrderWithStockRestore(order);
    }

    order.status = input.status;
    const updated = await this.repository.save(order);

    log.info('Order status updated', { orderId, newStatus: updated.status });
    return updated;
  }

  private async cancelOrderWithStockRestore(order: Order): Promise<Order> {
    await this.dataSource.transaction(async (manager) => {
      for (const item of order.items) {
        await manager.increment(ProductVariant, { id: item.variantId }, 'quantity', item.quantity);
      }

      await manager.getRepository(Order).save({ ...order, status: ORDER_STATUS.CANCELLED });
    });

    const updated = await this.requireOrderWithRelations(order.id, ['items']);
    log.info('Order status updated', { orderId: order.id, newStatus: ORDER_STATUS.CANCELLED });
    return updated;
  }

  async updateShippingStatus(orderId: string, input: UpdateShippingStatusInput): Promise<Order> {
    log.info('Updating order shipping status', {
      orderId,
      newShippingStatus: input.shippingStatus,
    });

    const order = await this.requireOrderWithRelations(orderId, ['items']);
    assertShippingTransition(order.shippingStatus, input.shippingStatus);

    order.shippingStatus = input.shippingStatus;
    const updated = await this.repository.save(order);

    log.info('Order shipping status updated', {
      orderId,
      newShippingStatus: updated.shippingStatus,
    });
    return updated;
  }

  async remove(orderId: string): Promise<void> {
    log.info('Deleting order', { orderId });

    const order = await this.requireOrderWithRelations(orderId, ['items']);
    const isDeletable =
      order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CANCELLED;
    if (!isDeletable) {
      throw new BadRequestError(ERROR_MESSAGES.ORDER.CANNOT_DELETE_ORDER);
    }

    await this.dataSource.transaction(async (manager) => {
      if (order.status === ORDER_STATUS.PENDING) {
        for (const item of order.items) {
          await manager.increment(
            ProductVariant,
            { id: item.variantId },
            'quantity',
            item.quantity,
          );
        }
      }

      await manager.softDelete(Order, orderId);
    });
  }

  findAll(options: {
    query: ListOrdersQuery;
    requesterId: string;
    isAdmin: boolean;
  }): Promise<PaginatedResponse<Order[]>> {
    log.info('Listing orders', { requesterId: options.requesterId, isAdmin: options.isAdmin });
    return this.repository.findAll(options.query, {
      requesterId: options.requesterId,
      isAdmin: options.isAdmin,
    });
  }

  async findById(options: {
    orderId: string;
    requesterId: string;
    isAdmin: boolean;
  }): Promise<Order> {
    log.info('Getting order by id', { orderId: options.orderId, requesterId: options.requesterId });

    const order = await this.repository.findByIdWithRelations(options.orderId, ['items', 'user'], {
      withDeleted: options.isAdmin,
    });
    if (!order) {
      throw new NotFoundError('Order');
    }
    if (!options.isAdmin && order.userId !== options.requesterId) {
      throw new ForbiddenError();
    }

    return order;
  }

  private async requireOrderWithRelations(orderId: string, relations: string[]): Promise<Order> {
    const order = await this.repository.findByIdWithRelations(orderId, relations);
    if (!order) {
      throw new NotFoundError('Order');
    }

    return order;
  }

  private async createOrderWithTransaction(params: {
    input: CreateOrderInput;
    userId: string;
    variantIds: string[];
    shippingMethodName: string;
    itemData: Array<{
      variantId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      discountAmount: number;
      finalPrice: number;
      subTotal: number;
      productName: string;
      productImage: string | null;
      variantName: string;
    }>;
    subTotal: number;
    tax: number;
    shippingFee: number;
    totalAmount: number;
  }): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const addressSnapshot = await this.resolveAddressSnapshot(
        manager,
        params.userId,
        params.input,
      );

      const lockedVariants = await manager
        .getRepository(ProductVariant)
        .createQueryBuilder('v')
        .whereInIds(params.variantIds)
        .setLock('pessimistic_write')
        .getMany();

      const lockedVariantMap = new Map(lockedVariants.map((variant) => [variant.id, variant]));

      for (const item of params.input.items) {
        const lockedVariant = lockedVariantMap.get(item.variantId);
        if (!lockedVariant) {
          throw new NotFoundError('Product variant');
        }
        if (lockedVariant.quantity < item.quantity) {
          throw new BadRequestError(
            ERROR_MESSAGES.ORDER.INSUFFICIENT_STOCK(lockedVariant.sku, lockedVariant.quantity),
          );
        }
      }

      const order = manager.getRepository(Order).create({
        userId: params.userId,
        shippingMethodId: params.input.shippingMethodId,
        orderNumber: generateOrderNumber(),
        paymentMethod: params.input.paymentMethod,
        subTotal: params.subTotal,
        tax: params.tax,
        shippingFee: params.shippingFee,
        totalAmount: params.totalAmount,
        shippingMethodName: params.shippingMethodName,
        addressSnapshot,
        note: params.input.note ?? null,
        updatedBy: null,
        items: params.itemData.map((item) => manager.getRepository(OrderItem).create(item)),
      });

      const saved = await manager.save(order);

      for (const item of params.input.items) {
        await manager.decrement(ProductVariant, { id: item.variantId }, 'quantity', item.quantity);
      }

      const paymentResult = await PaymentStrategyFactory.create(
        params.input.paymentMethod,
      ).initiate(saved);
      if (saved.paymentStatus !== paymentResult.paymentStatus) {
        await manager.update(Order, saved.id, {
          paymentStatus: paymentResult.paymentStatus,
        });
        saved.paymentStatus = paymentResult.paymentStatus;
      }

      return saved.id;
    });
  }

  private async resolveAddressSnapshot(
    manager: EntityManager,
    userId: string,
    input: CreateOrderInput,
  ): Promise<ReturnType<typeof toAddressSnapshot>> {
    const addressRepo = manager.getRepository(UserAddress);
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

      return toAddressSnapshot(saved);
    }

    return toAddressSnapshot(input.shippingAddress);
  }
}
