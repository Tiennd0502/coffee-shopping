import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { User } from '@/modules/user/user.entity';
import { UserController } from '@/modules/user/user.v1.controller';
import { USER_ROLE, USER_STATUS } from '@/shared/enums/user';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_USER_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

const makeUser = (): User =>
  ({
    id: USER_ID,
    clerkId: 'clerk_test',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: null,
    avatarUrl: null,
    status: USER_STATUS.ACTIVE,
    role: USER_ROLE.USER,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  }) as User;

const createMockRes = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  }) as unknown as Response;

describe('UserController', () => {
  const mockService = {
    findById: jest.fn(),
    findAddressesByUserId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  let controller: UserController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController(mockService as never);
  });

  it('getMe loads user and addresses and returns 200', async () => {
    const req = { userId: USER_ID } as Request;
    const res = createMockRes();
    const user = makeUser();
    mockService.findById.mockResolvedValue(user);
    mockService.findAddressesByUserId.mockResolvedValue([]);

    await controller.getMe(req, res);

    expect(mockService.findById).toHaveBeenCalledWith(USER_ID);
    expect(mockService.findAddressesByUserId).toHaveBeenCalledWith(USER_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: user.id }) }),
    );
  });

  it('list calls findAll with query and req.userId and returns 200', async () => {
    const req = { userId: USER_ID, query: { page: '1', limit: '10' } } as unknown as Request;
    const res = createMockRes();
    const user = makeUser();
    const paged = {
      data: [user],
      meta: { currentPage: 1, pageCount: 1, limit: 10, totalCount: 1 },
    };
    mockService.findAll.mockResolvedValue(paged);

    await controller.list(req, res);

    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, USER_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('get calls findById with params.id and returns 200', async () => {
    const req = { params: { id: OTHER_USER_ID } } as unknown as Request;
    const res = createMockRes();
    const user = makeUser();
    mockService.findById.mockResolvedValue(user);

    await controller.get(req, res);

    expect(mockService.findById).toHaveBeenCalledWith(OTHER_USER_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: user.id }) }),
    );
  });

  it('create calls service with body only and returns 201', async () => {
    const req = {
      body: {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
      },
    } as Request;
    const res = createMockRes();
    const user = makeUser();
    mockService.create.mockResolvedValue(user);

    await controller.create(req, res);

    expect(mockService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        status: USER_STATUS.ACTIVE,
        role: USER_ROLE.USER,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  it('update calls service with id and body and returns 200', async () => {
    const req = {
      params: { id: OTHER_USER_ID },
      body: { firstName: 'Updated' },
    } as unknown as Request;
    const res = createMockRes();
    const user = makeUser();
    mockService.update.mockResolvedValue(user);

    await controller.update(req, res);

    expect(mockService.update).toHaveBeenCalledWith(OTHER_USER_ID, req.body);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('remove calls service with params.id and returns 204', async () => {
    const req = { params: { id: OTHER_USER_ID } } as unknown as Request;
    const res = createMockRes();
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(req, res);

    expect(mockService.remove).toHaveBeenCalledWith(OTHER_USER_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    expect(res.send).toHaveBeenCalled();
  });
});
