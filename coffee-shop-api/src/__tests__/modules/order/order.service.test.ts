import type { DataSource } from 'typeorm';

import type { ListOrdersQuery } from '@/modules/order/order.dto';
import { Order } from '@/modules/order/order.entity';
import { OrderItem } from '@/modules/order/order-item.entity';
import {
  assertShippingTransition,
  assertValidOrderStatusTransition,
} from '@/modules/order/order-state';
import { OrderService } from '@/modules/order/order.service';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import { UserAddress } from '@/modules/user/user-address.entity';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from '@/shared/enums/order';
import { USER_STATUS } from '@/shared/enums/user';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/shared/errors/app';
import { PaymentStrategyFactory } from '@/shared/strategies/payment/payment.factory';

jest.mock('@/config/logger', () => ({
  createModuleLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('@/shared/strategies/payment/payment.factory', () => ({
  PaymentStrategyFactory: {
    create: jest.fn(),
  },
}));

const mockOrderRepo = {
  findByIdWithRelations: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
};

const mockUserRepo = {
  findById: jest.fn(),
};

const mockShippingRepo = {
  findActiveById: jest.fn(),
};

const mockVariantRepo = {
  findByIds: jest.fn(),
};

const mockEntityManager = {
  increment: jest.fn(),
  softDelete: jest.fn(),
  decrement: jest.fn(),
  getRepository: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
} as unknown as DataSource;

const makeOrder = (status: ORDER_STATUS, shippingStatus = SHIPPING_STATUS.PENDING): Order =>
  ({
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    status,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    paymentMethod: PAYMENT_METHOD.COD,
    shippingStatus,
    shippingMethodId: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    orderNumber: 'ORD-TEST-0001',
    shippingFee: 10000,
    shippingMethodName: 'Standard',
    subTotal: 100000,
    tax: 8000,
    totalAmount: 118000,
    addressSnapshot: {
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '0123456789',
      addressLine: '123 Nguyen Trai',
      city: 'HCM',
    },
    note: null,
    updatedBy: null,
    items: [],
  }) as unknown as Order;

const buildService = (): OrderService =>
  new OrderService({
    orderRepo: mockOrderRepo as never,
    userRepo: mockUserRepo as never,
    shippingRepo: mockShippingRepo as never,
    variantRepo: mockVariantRepo as never,
    dataSource: mockDataSource,
  });

describe('assertValidOrderStatusTransition', () => {
  it.each([
    [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED],
    [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  ])('allows %s -> %s', (from, to) => {
    expect(() => assertValidOrderStatusTransition(from, to)).not.toThrow();
  });

  it.each([
    [ORDER_STATUS.PENDING, ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PENDING],
    [ORDER_STATUS.COMPLETED, ORDER_STATUS.CONFIRMED],
    [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING],
  ])('rejects %s -> %s', (from, to) => {
    expect(() => assertValidOrderStatusTransition(from, to)).toThrow(BadRequestError);
  });
});

describe('assertShippingTransition', () => {
  it.each([
    [SHIPPING_STATUS.PENDING, SHIPPING_STATUS.SHIPPING],
    [SHIPPING_STATUS.SHIPPING, SHIPPING_STATUS.DELIVERED],
    [SHIPPING_STATUS.SHIPPING, SHIPPING_STATUS.RETURNED],
  ])('allows %s -> %s', (from, to) => {
    expect(() => assertShippingTransition(from, to)).not.toThrow();
  });

  it.each([
    [SHIPPING_STATUS.PENDING, SHIPPING_STATUS.DELIVERED],
    [SHIPPING_STATUS.PENDING, SHIPPING_STATUS.RETURNED],
    [SHIPPING_STATUS.SHIPPING, SHIPPING_STATUS.SHIPPING],
    [SHIPPING_STATUS.DELIVERED, SHIPPING_STATUS.SHIPPING],
    [SHIPPING_STATUS.RETURNED, SHIPPING_STATUS.PENDING],
  ])('rejects %s -> %s', (from, to) => {
    expect(() => assertShippingTransition(from, to)).toThrow(BadRequestError);
  });
});

describe('OrderService.create', () => {
  let service: OrderService;
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const variantId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const shippingMethodId = 'c56a4180-65aa-42ec-a945-5fd21dec0538';
  const newOrderId = '11111111-2222-4333-8444-555555555555';

  const baseInput = {
    shippingAddress: {
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '0123456789',
      addressLine: '123 Nguyen Trai Street District One',
      city: 'HCM',
    },
    shippingMethodId,
    paymentMethod: PAYMENT_METHOD.STRIPE,
    items: [{ variantId, quantity: 1 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();

    mockUserRepo.findById.mockResolvedValue({
      id: userId,
      status: USER_STATUS.ACTIVE,
    });
    mockShippingRepo.findActiveById.mockResolvedValue({
      id: shippingMethodId,
      name: 'Standard',
      price: '10000',
    });
    mockVariantRepo.findByIds.mockResolvedValue([
      {
        id: variantId,
        sku: 'SKU1',
        quantity: 10,
        price: '50000',
        discountValue: null,
        discountType: null,
        name: 'Variant A',
        product: {
          id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          name: 'Coffee',
          images: [],
        },
      },
    ]);

    (mockDataSource.transaction as jest.Mock).mockImplementation(
      async (cb: (manager: unknown) => Promise<string>) => {
        const addressRepo = {
          count: jest.fn().mockResolvedValue(1),
        };
        const manager = {
          getRepository: jest.fn((entity: unknown) => {
            if (entity === UserAddress) return addressRepo;
            if (entity === Order)
              return {
                create: jest.fn((data: unknown) => data),
              };
            if (entity === OrderItem)
              return {
                create: jest.fn((item: unknown) => item),
              };
            return {};
          }),
          save: jest.fn(async (order: object) => ({
            ...order,
            id: newOrderId,
          })),
          decrement: jest.fn().mockResolvedValue(undefined),
          update: jest.fn().mockResolvedValue(undefined),
        };
        return cb(manager);
      },
    );

    jest.mocked(PaymentStrategyFactory.create).mockReturnValue({
      initiate: jest.fn().mockResolvedValue({ paymentStatus: PAYMENT_STATUS.PAID }),
    });
  });

  it('persists PAID when payment strategy returns PAID', async () => {
    const fullOrder = {
      ...makeOrder(ORDER_STATUS.PENDING),
      id: newOrderId,
      paymentMethod: PAYMENT_METHOD.STRIPE,
      paymentStatus: PAYMENT_STATUS.PAID,
    };
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(fullOrder);

    const result = await service.create(baseInput, userId);

    expect(PaymentStrategyFactory.create).toHaveBeenCalledWith(PAYMENT_METHOD.STRIPE);
    expect(mockOrderRepo.save).not.toHaveBeenCalled();
    expect(result.paymentStatus).toBe(PAYMENT_STATUS.PAID);
  });

  it('does not call repository.save when strategy UNPAID matches order (COD)', async () => {
    const fullOrder = {
      ...makeOrder(ORDER_STATUS.PENDING),
      id: newOrderId,
      paymentMethod: PAYMENT_METHOD.COD,
      paymentStatus: PAYMENT_STATUS.UNPAID,
    };
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(fullOrder);
    jest.mocked(PaymentStrategyFactory.create).mockReturnValue({
      initiate: jest.fn().mockResolvedValue({ paymentStatus: PAYMENT_STATUS.UNPAID }),
    });

    const result = await service.create(
      { ...baseInput, paymentMethod: PAYMENT_METHOD.COD },
      userId,
    );

    expect(mockOrderRepo.save).not.toHaveBeenCalled();
    expect(result.paymentStatus).toBe(PAYMENT_STATUS.UNPAID);
  });
});

describe('OrderService.updateStatus', () => {
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
    (mockDataSource.transaction as jest.Mock).mockImplementation(
      async (cb: (manager: typeof mockEntityManager) => Promise<void>) => cb(mockEntityManager),
    );
  });

  it('transitions PENDING -> CONFIRMED and returns saved order', async () => {
    const order = makeOrder(ORDER_STATUS.PENDING);
    const saved = { ...order, status: ORDER_STATUS.CONFIRMED };

    mockOrderRepo.findByIdWithRelations.mockResolvedValue(order);
    mockOrderRepo.save.mockResolvedValue(saved);

    const result = await service.updateStatus(order.id, { status: ORDER_STATUS.CONFIRMED });

    expect(mockOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: ORDER_STATUS.CONFIRMED }),
    );
    expect(result.status).toBe(ORDER_STATUS.CONFIRMED);
  });

  it('transitions PENDING -> CANCELLED, restores stock, and returns saved order', async () => {
    const order = {
      ...makeOrder(ORDER_STATUS.PENDING),
      items: [
        { variantId: 'v1', quantity: 2 },
        { variantId: 'v2', quantity: 1 },
      ],
    };
    const cancelled = { ...order, status: ORDER_STATUS.CANCELLED };

    mockOrderRepo.findByIdWithRelations
      .mockResolvedValueOnce(order)
      .mockResolvedValueOnce(cancelled);
    mockEntityManager.increment.mockResolvedValue(undefined);
    mockEntityManager.getRepository = jest.fn().mockReturnValue({ save: jest.fn() });

    const result = await service.updateStatus(order.id, { status: ORDER_STATUS.CANCELLED });

    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    expect(mockEntityManager.increment).toHaveBeenCalledTimes(2);
    expect(mockEntityManager.increment).toHaveBeenNthCalledWith(
      1,
      ProductVariant,
      { id: 'v1' },
      'quantity',
      2,
    );
    expect(mockEntityManager.increment).toHaveBeenNthCalledWith(
      2,
      ProductVariant,
      { id: 'v2' },
      'quantity',
      1,
    );
    expect(result.status).toBe(ORDER_STATUS.CANCELLED);
  });

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(
      service.updateStatus('11111111-2222-4333-8444-555555555555', {
        status: ORDER_STATUS.CONFIRMED,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError on invalid transition (PENDING -> COMPLETED)', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(makeOrder(ORDER_STATUS.PENDING));

    await expect(
      service.updateStatus('f47ac10b-58cc-4372-a567-0e02b2c3d479', {
        status: ORDER_STATUS.COMPLETED,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe('OrderService.remove', () => {
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
    (mockDataSource.transaction as jest.Mock).mockImplementation(
      async (cb: (manager: typeof mockEntityManager) => Promise<void>) => cb(mockEntityManager),
    );
  });

  it('soft deletes a PENDING order and restores variant quantities', async () => {
    const order = {
      ...makeOrder(ORDER_STATUS.PENDING),
      items: [
        { variantId: 'v1', quantity: 2 },
        { variantId: 'v2', quantity: 1 },
      ],
    };
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(order);
    mockEntityManager.increment.mockResolvedValue(undefined);
    mockEntityManager.softDelete.mockResolvedValue(undefined);

    await service.remove(order.id);

    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    expect(mockEntityManager.increment).toHaveBeenCalledTimes(2);
    expect(mockEntityManager.increment).toHaveBeenNthCalledWith(
      1,
      ProductVariant,
      { id: 'v1' },
      'quantity',
      2,
    );
    expect(mockEntityManager.increment).toHaveBeenNthCalledWith(
      2,
      ProductVariant,
      { id: 'v2' },
      'quantity',
      1,
    );
    expect(mockEntityManager.softDelete).toHaveBeenCalledWith(Order, order.id);
  });

  it('soft deletes a CANCELLED order without restoring variant quantities (already restored at cancel)', async () => {
    const order = {
      ...makeOrder(ORDER_STATUS.CANCELLED),
      items: [
        { variantId: 'v1', quantity: 2 },
        { variantId: 'v2', quantity: 1 },
      ],
    };
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(order);
    mockEntityManager.softDelete.mockResolvedValue(undefined);

    await service.remove(order.id);

    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    expect(mockEntityManager.increment).not.toHaveBeenCalled();
    expect(mockEntityManager.softDelete).toHaveBeenCalledWith(Order, order.id);
  });

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(service.remove('non-existent')).rejects.toBeInstanceOf(NotFoundError);
    expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it.each([ORDER_STATUS.CONFIRMED, ORDER_STATUS.COMPLETED])(
    'throws BadRequestError when order status is %s',
    async (status) => {
      mockOrderRepo.findByIdWithRelations.mockResolvedValue({ ...makeOrder(status), items: [] });

      await expect(service.remove('f47ac10b-58cc-4372-a567-0e02b2c3d479')).rejects.toBeInstanceOf(
        BadRequestError,
      );
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    },
  );

  it('propagates error thrown inside transaction', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue({
      ...makeOrder(ORDER_STATUS.PENDING),
      items: [],
    });
    mockEntityManager.softDelete.mockRejectedValue(new Error('DB error'));

    await expect(service.remove('f47ac10b-58cc-4372-a567-0e02b2c3d479')).rejects.toThrow(
      'DB error',
    );
  });
});

describe('OrderService.updateShippingStatus', () => {
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  it('transitions PENDING -> SHIPPING and returns saved order', async () => {
    const order = makeOrder(ORDER_STATUS.CONFIRMED, SHIPPING_STATUS.PENDING);
    const saved = { ...order, shippingStatus: SHIPPING_STATUS.SHIPPING };

    mockOrderRepo.findByIdWithRelations.mockResolvedValue(order);
    mockOrderRepo.save.mockResolvedValue(saved);

    const result = await service.updateShippingStatus(order.id, {
      shippingStatus: SHIPPING_STATUS.SHIPPING,
    });

    expect(mockOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ shippingStatus: SHIPPING_STATUS.SHIPPING }),
    );
    expect(result.shippingStatus).toBe(SHIPPING_STATUS.SHIPPING);
  });

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(
      service.updateShippingStatus('11111111-2222-4333-8444-555555555555', {
        shippingStatus: SHIPPING_STATUS.SHIPPING,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError on invalid transition (PENDING -> DELIVERED)', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(
      makeOrder(ORDER_STATUS.CONFIRMED, SHIPPING_STATUS.PENDING),
    );

    await expect(
      service.updateShippingStatus('f47ac10b-58cc-4372-a567-0e02b2c3d479', {
        shippingStatus: SHIPPING_STATUS.DELIVERED,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe('OrderService.findAll', () => {
  const baseQuery: ListOrdersQuery = { page: 1, limit: 10, status: undefined };
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  it('returns orders with meta for requester context', async () => {
    const mockOrders = [makeOrder(ORDER_STATUS.PENDING), makeOrder(ORDER_STATUS.CONFIRMED)];
    mockOrderRepo.findAll.mockResolvedValue({
      data: mockOrders,
      meta: { limit: 10, currentPage: 1, pageCount: 1, totalCount: 2 },
    });

    const result = await service.findAll({
      query: baseQuery,
      requesterId: 'admin-id',
      isAdmin: true,
    });

    expect(mockOrderRepo.findAll).toHaveBeenCalledWith(baseQuery, {
      requesterId: 'admin-id',
      isAdmin: true,
    });
    expect(result.data).toHaveLength(2);
    expect(result.meta).toEqual({ limit: 10, currentPage: 1, pageCount: 1, totalCount: 2 });
  });
});

describe('OrderService.findById', () => {
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  it('returns order when requester is the owner', async () => {
    const mockOrder = makeOrder(ORDER_STATUS.PENDING);
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(mockOrder);

    const result = await service.findById({
      orderId: mockOrder.id,
      requesterId: mockOrder.userId,
      isAdmin: false,
    });

    expect(mockOrderRepo.findByIdWithRelations).toHaveBeenCalledWith(
      mockOrder.id,
      ['items', 'user'],
      { withDeleted: false },
    );
    expect(result).toEqual(mockOrder);
  });

  it('returns order when requester is admin', async () => {
    const mockOrder = makeOrder(ORDER_STATUS.PENDING);
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(mockOrder);

    const result = await service.findById({
      orderId: mockOrder.id,
      requesterId: 'admin-id',
      isAdmin: true,
    });

    expect(mockOrderRepo.findByIdWithRelations).toHaveBeenCalledWith(
      mockOrder.id,
      ['items', 'user'],
      { withDeleted: true },
    );
    expect(result).toEqual(mockOrder);
  });

  it('admin can view a soft-deleted order', async () => {
    const deletedOrder = { ...makeOrder(ORDER_STATUS.CANCELLED), deletedAt: new Date() };
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(deletedOrder);

    const result = await service.findById({
      orderId: deletedOrder.id,
      requesterId: 'admin-id',
      isAdmin: true,
    });

    expect(result).toEqual(deletedOrder);
  });

  it('non-admin cannot view a soft-deleted order', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(
      service.findById({ orderId: 'deleted-id', requesterId: 'user-id', isAdmin: false }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(
      service.findById({ orderId: 'non-existent', requesterId: 'user-id', isAdmin: false }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ForbiddenError when non-admin requester is not the owner', async () => {
    const mockOrder = makeOrder(ORDER_STATUS.PENDING);
    mockOrderRepo.findByIdWithRelations.mockResolvedValue(mockOrder);

    await expect(
      service.findById({ orderId: mockOrder.id, requesterId: 'other-user-id', isAdmin: false }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
