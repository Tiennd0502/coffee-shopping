import AppDataSource from '@/config/database';
import { Order } from '@/modules/order/order.entity';
import { assertValidOrderStatusTransition } from '@/modules/order/order-state';
import { updateOrderStatus } from '@/modules/order/order.service';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from '@/shared/enums/order';
import { BadRequestError, NotFoundError } from '@/shared/errors/app';

jest.mock('@/config/logger', () => ({
  createModuleLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockOrderRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const makeOrder = (status: ORDER_STATUS): Order =>
  ({
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    status,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    paymentMethod: PAYMENT_METHOD.COD,
    shippingStatus: SHIPPING_STATUS.PENDING,
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

describe('OrderService.updateOrderStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) =>
        entity === Order ? (mockOrderRepo as never) : ({} as never),
      );
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
