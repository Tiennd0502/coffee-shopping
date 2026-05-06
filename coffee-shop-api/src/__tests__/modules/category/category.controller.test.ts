import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Category } from '@/modules/category/category.entity';
import { CategoryController } from '@/modules/category/category.v1.controller';
import { ConflictError, NotFoundError } from '@/shared/errors/app';

const CATEGORY_ID = 'c56a4180-65aa-4266-a945-5fd21dec0538';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const makeCategory = (): Category =>
  ({
    id: CATEGORY_ID,
    name: 'Espresso',
    slug: 'espresso',
    createdBy: USER_ID,
    updatedBy: null,
    deletedBy: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  }) as unknown as Category;

const createMockRes = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  }) as unknown as Response;

describe('CategoryController', () => {
  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  let controller: CategoryController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CategoryController(mockService as never);
  });

  it('list calls service with parsed query and returns 200 with data and meta', async () => {
    const req = { query: { page: '1', limit: '10' } } as unknown as Request;
    const res = createMockRes();
    const category = makeCategory();
    const paged = {
      data: [category],
      meta: { currentPage: 1, pageCount: 1, limit: 10, totalCount: 1 },
    };
    mockService.findAll.mockResolvedValue(paged);

    await controller.list(req, res);

    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Array),
        meta: paged.meta,
      }),
    );
  });

  it('get calls service with params.id and returns 200', async () => {
    const req = { params: { id: CATEGORY_ID } } as unknown as Request;
    const res = createMockRes();
    const category = makeCategory();
    mockService.findById.mockResolvedValue(category);

    await controller.get(req, res);

    expect(mockService.findById).toHaveBeenCalledWith(CATEGORY_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: category.id }) }),
    );
  });

  it('create calls service with body and req.userId and returns 201', async () => {
    const req = {
      userId: USER_ID,
      body: { name: 'Espresso' },
    } as unknown as Request;
    const res = createMockRes();
    const category = makeCategory();
    mockService.create.mockResolvedValue(category);

    await controller.create(req, res);

    expect(mockService.create).toHaveBeenCalledWith(req.body, req.userId);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  it('update calls service with id, body, and req.userId and returns 200', async () => {
    const req = {
      userId: USER_ID,
      params: { id: CATEGORY_ID },
      body: { name: 'Cold Brew' },
    } as unknown as Request;
    const res = createMockRes();
    const category = makeCategory();
    mockService.update.mockResolvedValue(category);

    await controller.update(req, res);

    expect(mockService.update).toHaveBeenCalledWith(CATEGORY_ID, req.body, req.userId);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('remove calls service with id and req.userId, returns 204, and sends empty body', async () => {
    const req = { userId: USER_ID, params: { id: CATEGORY_ID } } as unknown as Request;
    const res = createMockRes();
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(req, res);

    expect(mockService.remove).toHaveBeenCalledWith(CATEGORY_ID, req.userId);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    expect(res.send).toHaveBeenCalled();
  });

  it('propagates errors from get when service throws', async () => {
    const req = { params: { id: CATEGORY_ID } } as unknown as Request;
    const res = createMockRes();
    mockService.findById.mockRejectedValue(new NotFoundError('Category'));

    await expect(controller.get(req, res)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('propagates errors from create when service throws', async () => {
    const req = { userId: USER_ID, body: { name: 'Espresso' } } as unknown as Request;
    const res = createMockRes();
    mockService.create.mockRejectedValue(new ConflictError('taken'));

    await expect(controller.create(req, res)).rejects.toThrow('taken');
  });
});
