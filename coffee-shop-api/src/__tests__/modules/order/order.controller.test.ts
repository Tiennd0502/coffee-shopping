import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { OrderController } from '@/modules/order/order.v1.controller';
import type { Order } from '@/modules/order/order.entity';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from '@/shared/enums/order';
import { USER_ROLE } from '@/shared/enums/user';

const makeOrder = (): Order =>
  ({
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    user: null,
    shippingMethodId: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    orderNumber: 'ORD-TEST-0001',
    paymentMethod: PAYMENT_METHOD.COD,
    status: ORDER_STATUS.PENDING,
    shippingStatus: SHIPPING_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    subTotal: 100000,
    tax: 8000,
    shippingFee: 10000,
    totalAmount: 118000,
    shippingMethodName: 'Standard',
    addressSnapshot: {
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '0123456789',
      addressLine: '123 Nguyen Trai Street District One',
      city: 'HCM',
    },
    note: null,
    items: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  }) as unknown as Order;

const createMockRes = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  }) as unknown as Response;

describe('OrderController', () => {
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    updateShippingStatus: jest.fn(),
    remove: jest.fn(),
  };
  let controller: OrderController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrderController(mockService as never);
  });

  it('create returns 201 with mapped order response', async () => {
    const req = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      body: {
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '0123456789',
          addressLine: '123 Nguyen Trai Street District One',
          city: 'HCM',
        },
        shippingMethodId: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
        paymentMethod: PAYMENT_METHOD.COD,
        items: [{ variantId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', quantity: 1 }],
      },
    } as Request;
    const res = createMockRes();
    const order = makeOrder();
    mockService.create.mockResolvedValue(order);

    await controller.create(req, res);

    expect(mockService.create).toHaveBeenCalledWith(req.body, req.userId);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: order.id, orderNumber: order.orderNumber }),
      }),
    );
  });

  it('list passes isAdmin=false for user and returns paginated result', async () => {
    const req = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      userRole: USER_ROLE.USER,
      query: { page: '1', limit: '10' },
    } as unknown as Request;
    const res = createMockRes();
    const order = makeOrder();
    const paged = {
      data: [order],
      meta: { currentPage: 1, pageCount: 1, limit: 10, totalCount: 1 },
    };
    mockService.findAll.mockResolvedValue(paged);

    await controller.list(req, res);

    expect(mockService.findAll).toHaveBeenCalledWith({
      query: { page: 1, limit: 10 },
      requesterId: req.userId,
      isAdmin: false,
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array), meta: paged.meta }),
    );
  });

  it('get passes isAdmin=true when requester is admin', async () => {
    const req = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      userRole: USER_ROLE.ADMIN,
      params: { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
    } as unknown as Request;
    const res = createMockRes();
    const order = makeOrder();
    mockService.findById.mockResolvedValue(order);

    await controller.get(req, res);

    expect(mockService.findById).toHaveBeenCalledWith({
      orderId: req.params.id,
      requesterId: req.userId,
      isAdmin: true,
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: order.id }) }),
    );
  });

  it('updateStatus validates input and returns updated order', async () => {
    const req = {
      params: { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
      body: { status: ORDER_STATUS.CONFIRMED },
    } as unknown as Request;
    const res = createMockRes();
    const order = { ...makeOrder(), status: ORDER_STATUS.CONFIRMED } as Order;
    mockService.updateStatus.mockResolvedValue(order);

    await controller.updateStatus(req, res);

    expect(mockService.updateStatus).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('updateShippingStatus validates input and returns updated order', async () => {
    const req = {
      params: { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
      body: { shippingStatus: SHIPPING_STATUS.SHIPPING },
    } as unknown as Request;
    const res = createMockRes();
    const order = { ...makeOrder(), shippingStatus: SHIPPING_STATUS.SHIPPING } as Order;
    mockService.updateShippingStatus.mockResolvedValue(order);

    await controller.updateShippingStatus(req, res);

    expect(mockService.updateShippingStatus).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('remove returns 204 and no body', async () => {
    const req = {
      params: { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
    } as unknown as Request;
    const res = createMockRes();
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(req, res);

    expect(mockService.remove).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    expect(res.send).toHaveBeenCalled();
  });
});
