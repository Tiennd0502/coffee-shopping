import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Product } from '@/modules/product/product.entity';
import { ProductController } from '@/modules/product/product.v1.controller';
import { PRODUCT_STATUS, ROAST_LEVEL } from '@/shared/enums/product';
import { USER_ROLE } from '@/shared/enums/user';
import { ConflictError, NotFoundError } from '@/shared/errors/app';

const PRODUCT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const CATEGORY_ID = 'c56a4180-65aa-4266-a945-5fd21dec0538';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const makeProduct = (): Product =>
  ({
    id: PRODUCT_ID,
    categoryId: CATEGORY_ID,
    name: 'House Blend',
    slug: 'house-blend',
    description: null,
    roastLevel: ROAST_LEVEL.MEDIUM,
    isOrganic: false,
    isFairTrade: false,
    status: PRODUCT_STATUS.ACTIVE,
    tastingNotes: null,
    origin: null,
    processingMethod: null,
    createdBy: USER_ID,
    updatedBy: null,
    variants: [],
    images: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  }) as unknown as Product;

const createMockRes = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  }) as unknown as Response;

describe('ProductController', () => {
  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  let controller: ProductController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProductController(mockService as never);
  });

  it('list calls service with query and isAdmin derived from role and returns 200', async () => {
    const req = {
      userRole: USER_ROLE.ADMIN,
      query: { page: '1', limit: '10' },
    } as unknown as Request;
    const res = createMockRes();
    const product = makeProduct();
    const paged = {
      data: [product],
      meta: { currentPage: 1, pageCount: 1, limit: 10, totalCount: 1 },
    };
    mockService.findAll.mockResolvedValue(paged);

    await controller.list(req, res);

    expect(mockService.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      {
        isAdmin: true,
      },
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Array),
        meta: paged.meta,
      }),
    );
  });

  it('list passes isAdmin false for non-admin requesters', async () => {
    const req = {
      userRole: USER_ROLE.USER,
      query: { page: '1', limit: '10' },
    } as unknown as Request;
    const res = createMockRes();
    mockService.findAll.mockResolvedValue({
      data: [],
      meta: { currentPage: 1, pageCount: 0, limit: 10, totalCount: 0 },
    });

    await controller.list(req, res);

    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, { isAdmin: false });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('get calls service with params.id and returns 200', async () => {
    const req = { params: { id: PRODUCT_ID } } as unknown as Request;
    const res = createMockRes();
    const product = makeProduct();
    mockService.findById.mockResolvedValue(product);

    await controller.get(req, res);

    expect(mockService.findById).toHaveBeenCalledWith(PRODUCT_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: product.id }) }),
    );
  });

  it('create calls service with body and req.userId and returns 201', async () => {
    const req = {
      userId: USER_ID,
      body: {
        categoryId: CATEGORY_ID,
        name: 'House Blend',
        roastLevel: ROAST_LEVEL.MEDIUM,
        isOrganic: false,
        isFairTrade: false,
        status: PRODUCT_STATUS.DRAFT,
        variants: [
          {
            sku: 'SKU-1',
            weight: 250,
            unit: 'G',
            price: 100000,
            quantity: 10,
          },
        ],
        images: [],
      },
    } as unknown as Request;
    const res = createMockRes();
    const product = makeProduct();
    mockService.create.mockResolvedValue(product);

    await controller.create(req, res);

    expect(mockService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: CATEGORY_ID,
        name: 'House Blend',
        roastLevel: ROAST_LEVEL.MEDIUM,
        status: PRODUCT_STATUS.DRAFT,
        variants: [
          expect.objectContaining({
            sku: 'SKU-1',
            weight: 250,
            unit: 'G',
            price: 100000,
            quantity: 10,
          }),
        ],
        images: [],
      }),
      USER_ID,
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  it('update calls service with id, body, and req.userId and returns 200', async () => {
    const req = {
      userId: USER_ID,
      params: { id: PRODUCT_ID },
      body: { name: 'Updated Name' },
    } as unknown as Request;
    const res = createMockRes();
    const product = makeProduct();
    mockService.update.mockResolvedValue(product);

    await controller.update(req, res);

    expect(mockService.update).toHaveBeenCalledWith(PRODUCT_ID, req.body, USER_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('remove calls service with id and req.userId and returns 204', async () => {
    const req = { userId: USER_ID, params: { id: PRODUCT_ID } } as unknown as Request;
    const res = createMockRes();
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(req, res);

    expect(mockService.remove).toHaveBeenCalledWith(PRODUCT_ID, USER_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    expect(res.send).toHaveBeenCalled();
  });

  it('propagates errors from get when service throws', async () => {
    const req = { params: { id: PRODUCT_ID } } as unknown as Request;
    const res = createMockRes();
    mockService.findById.mockRejectedValue(new NotFoundError('Product'));

    await expect(controller.get(req, res)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('propagates errors from create when service throws', async () => {
    const req = {
      userId: USER_ID,
      body: {
        categoryId: CATEGORY_ID,
        name: 'House Blend',
        roastLevel: ROAST_LEVEL.MEDIUM,
        isOrganic: false,
        isFairTrade: false,
        status: PRODUCT_STATUS.DRAFT,
        variants: [
          {
            sku: 'SKU-1',
            weight: 250,
            unit: 'G',
            price: 100000,
            quantity: 10,
          },
        ],
        images: [],
      },
    } as unknown as Request;
    const res = createMockRes();
    mockService.create.mockRejectedValue(new ConflictError('slug taken'));

    await expect(controller.create(req, res)).rejects.toThrow('slug taken');
  });
});
