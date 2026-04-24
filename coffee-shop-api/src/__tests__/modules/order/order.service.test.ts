import AppDataSource from '@/config/database';
import type { ListOrdersQuery } from '@/modules/order/order.dto';
import { Order } from '@/modules/order/order.entity';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import {
  assertShippingTransition,
  assertValidOrderStatusTransition,
} from '@/modules/order/order-state';
import {
  deleteOrder,
  getOrderById,
  listOrders,
  updateOrderShippingStatus,
  updateOrderStatus,
} from '@/modules/order/order.service';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from '@/shared/enums/order';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/shared/errors/app';

jest.mock('@/config/logger', () => ({
  createModuleLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockOrderRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockEntityManager = {
  increment: jest.fn(),
  softDelete: jest.fn(),
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

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

describe('OrderService.updateOrderStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) =>
        entity === Order ? (mockOrderRepo as never) : ({} as never),
      );
    jest
      .spyOn(AppDataSource, 'transaction')
      .mockImplementation((async (cb: (manager: typeof mockEntityManager) => Promise<void>) =>
        cb(mockEntityManager)) as never);
  });

  it('transitions PENDING -> CONFIRMED and returns saved order', async () => {
    const order = makeOrder(ORDER_STATUS.PENDING);
    const saved = { ...order, status: ORDER_STATUS.CONFIRMED };

    mockOrderRepo.findOne.mockResolvedValue(order);
    mockOrderRepo.save.mockResolvedValue(saved);

    const result = await updateOrderStatus({
      orderId: order.id,
      input: { status: ORDER_STATUS.CONFIRMED },
    });

    expect(mockOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: ORDER_STATUS.CONFIRMED }),
    );
    expect(result.status).toBe(ORDER_STATUS.CONFIRMED);
  });

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findOne.mockResolvedValue(null);

    await expect(
      updateOrderStatus({
        orderId: '11111111-2222-4333-8444-555555555555',
        input: { status: ORDER_STATUS.CONFIRMED },
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError on invalid transition (PENDING -> COMPLETED)', async () => {
    mockOrderRepo.findOne.mockResolvedValue(makeOrder(ORDER_STATUS.PENDING));

    await expect(
      updateOrderStatus({
        orderId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        input: { status: ORDER_STATUS.COMPLETED },
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe('OrderService.deleteOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) =>
        entity === Order ? (mockOrderRepo as never) : ({} as never),
      );
    jest
      .spyOn(AppDataSource, 'transaction')
      .mockImplementation((async (cb: (manager: typeof mockEntityManager) => Promise<void>) =>
        cb(mockEntityManager)) as never);
  });

  it.each([ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED])(
    'soft deletes a %s order and restores variant quantities',
    async (status) => {
      const order = {
        ...makeOrder(status),
        items: [
          { variantId: 'v1', quantity: 2 },
          { variantId: 'v2', quantity: 1 },
        ],
      };
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockEntityManager.increment.mockResolvedValue(undefined);
      mockEntityManager.softDelete.mockResolvedValue(undefined);

      await deleteOrder({ orderId: order.id });

      expect(AppDataSource.transaction).toHaveBeenCalledTimes(1);
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
    },
  );

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findOne.mockResolvedValue(null);

    await expect(deleteOrder({ orderId: 'non-existent' })).rejects.toBeInstanceOf(NotFoundError);
    expect(AppDataSource.transaction).not.toHaveBeenCalled();
  });

  it.each([ORDER_STATUS.CONFIRMED, ORDER_STATUS.COMPLETED])(
    'throws BadRequestError when order status is %s',
    async (status) => {
      mockOrderRepo.findOne.mockResolvedValue({ ...makeOrder(status), items: [] });

      await expect(
        deleteOrder({ orderId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' }),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(AppDataSource.transaction).not.toHaveBeenCalled();
    },
  );

  it('propagates error thrown inside transaction', async () => {
    mockOrderRepo.findOne.mockResolvedValue({
      ...makeOrder(ORDER_STATUS.PENDING),
      items: [],
    });
    mockEntityManager.softDelete.mockRejectedValue(new Error('DB error'));

    await expect(deleteOrder({ orderId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })).rejects.toThrow(
      'DB error',
    );
  });
});

describe('OrderService.updateOrderShippingStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) =>
        entity === Order ? (mockOrderRepo as never) : ({} as never),
      );
  });

  it('transitions PENDING -> SHIPPING and returns saved order', async () => {
    const order = makeOrder(ORDER_STATUS.CONFIRMED, SHIPPING_STATUS.PENDING);
    const saved = { ...order, shippingStatus: SHIPPING_STATUS.SHIPPING };

    mockOrderRepo.findOne.mockResolvedValue(order);
    mockOrderRepo.save.mockResolvedValue(saved);

    const result = await updateOrderShippingStatus({
      orderId: order.id,
      input: { shippingStatus: SHIPPING_STATUS.SHIPPING },
    });

    expect(mockOrderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ shippingStatus: SHIPPING_STATUS.SHIPPING }),
    );
    expect(result.shippingStatus).toBe(SHIPPING_STATUS.SHIPPING);
  });

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findOne.mockResolvedValue(null);

    await expect(
      updateOrderShippingStatus({
        orderId: '11111111-2222-4333-8444-555555555555',
        input: { shippingStatus: SHIPPING_STATUS.SHIPPING },
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError on invalid transition (PENDING -> DELIVERED)', async () => {
    mockOrderRepo.findOne.mockResolvedValue(
      makeOrder(ORDER_STATUS.CONFIRMED, SHIPPING_STATUS.PENDING),
    );

    await expect(
      updateOrderShippingStatus({
        orderId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        input: { shippingStatus: SHIPPING_STATUS.DELIVERED },
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe('OrderService.listOrders', () => {
  const baseQuery: ListOrdersQuery = { page: 1, limit: 10, status: undefined };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) =>
        entity === Order ? (mockOrderRepo as never) : ({} as never),
      );
  });

  it('returns all orders with meta when requester is admin', async () => {
    const mockOrders = [makeOrder(ORDER_STATUS.PENDING), makeOrder(ORDER_STATUS.CONFIRMED)];
    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);

    const result = await listOrders({
      query: baseQuery,
      requesterId: 'admin-id',
      isAdmin: true,
    });

    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('userId'),
      expect.anything(),
    );
    expect(result.data).toHaveLength(2);
    expect(result.meta).toEqual({ limit: 10, currentPage: 1, pageCount: 1, totalCount: 2 });
  });

  it('filters by userId when requester is not admin', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await listOrders({
      query: baseQuery,
      requesterId: 'user-id',
      isAdmin: false,
    });

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.userId = :userId', {
      userId: 'user-id',
    });
  });

  it('filters by status when status is provided', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await listOrders({
      query: { ...baseQuery, status: ORDER_STATUS.PENDING },
      requesterId: 'user-id',
      isAdmin: false,
    });

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.status = :status', {
      status: ORDER_STATUS.PENDING,
    });
  });

  it('calculates pageCount correctly', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

    const result = await listOrders({
      query: { page: 2, limit: 10, status: undefined },
      requesterId: 'user-id',
      isAdmin: false,
    });

    expect(result.meta).toEqual({ limit: 10, currentPage: 2, pageCount: 3, totalCount: 25 });
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });
});

describe('OrderService.getOrderById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) =>
        entity === Order ? (mockOrderRepo as never) : ({} as never),
      );
  });

  it('returns order when requester is the owner', async () => {
    const mockOrder = makeOrder(ORDER_STATUS.PENDING);
    mockOrderRepo.findOne.mockResolvedValue(mockOrder);

    const result = await getOrderById({
      orderId: mockOrder.id,
      requesterId: mockOrder.userId,
      isAdmin: false,
    });

    expect(result).toEqual(mockOrder);
  });

  it('returns order when requester is admin', async () => {
    const mockOrder = makeOrder(ORDER_STATUS.PENDING);
    mockOrderRepo.findOne.mockResolvedValue(mockOrder);

    const result = await getOrderById({
      orderId: mockOrder.id,
      requesterId: 'admin-id',
      isAdmin: true,
    });

    expect(result).toEqual(mockOrder);
  });

  it('throws NotFoundError when order does not exist', async () => {
    mockOrderRepo.findOne.mockResolvedValue(null);

    await expect(
      getOrderById({ orderId: 'non-existent', requesterId: 'user-id', isAdmin: false }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ForbiddenError when non-admin requester is not the owner', async () => {
    const mockOrder = makeOrder(ORDER_STATUS.PENDING);
    mockOrderRepo.findOne.mockResolvedValue(mockOrder);

    await expect(
      getOrderById({ orderId: mockOrder.id, requesterId: 'other-user-id', isAdmin: false }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
