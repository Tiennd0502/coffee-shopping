import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { USER_ROLE, USER_STATUS } from '@/shared/enums/user';
import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';

const mockGetAuth = jest.fn();
const mockFindUserByClerkId = jest.fn();

jest.mock('@clerk/express', () => ({
  getAuth: (...args: unknown[]) => mockGetAuth(...args),
}));

jest.mock('@/modules/user/user.service', () => ({
  findUserByClerkId: (...args: unknown[]) => mockFindUserByClerkId(...args),
}));

const createMockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    method: 'GET',
    originalUrl: '/test',
    ...overrides,
  }) as Request;

const res = {} as Response;
const next = jest.fn() as jest.MockedFunction<NextFunction>;

const expectNextCalledWithAppError = (code: string, statusCode: number, message: string): void => {
  expect(next).toHaveBeenCalledTimes(1);
  const err = next.mock.calls[0][0] as AppError;
  expect(err).toBeInstanceOf(AppError);
  expect(err.code).toBe(code);
  expect(err.statusCode).toBe(statusCode);
  expect(err.message).toBe(message);
};

describe('requireAuthenticated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws UNAUTHORIZED when getAuth throws', async () => {
    const { requireAuthenticated } = await import('@/middlewares/auth');
    mockGetAuth.mockImplementation(() => {
      throw new Error('Clerk not initialized');
    });

    await expect(requireAuthenticated(createMockRequest(), res, next)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: ERROR_MESSAGES.UNAUTHENTICATED,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('throws UNAUTHORIZED when clerkId is null', async () => {
    const { requireAuthenticated } = await import('@/middlewares/auth');
    mockGetAuth.mockReturnValue({ userId: null });

    await expect(requireAuthenticated(createMockRequest(), res, next)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: ERROR_MESSAGES.UNAUTHENTICATED,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('throws UNAUTHORIZED when user is not found', async () => {
    const { requireAuthenticated } = await import('@/middlewares/auth');
    mockGetAuth.mockReturnValue({ userId: 'clerk_123' });
    mockFindUserByClerkId.mockResolvedValue(null);

    await expect(requireAuthenticated(createMockRequest(), res, next)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: ERROR_MESSAGES.UNAUTHENTICATED,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('throws FORBIDDEN when user account is inactive', async () => {
    const { requireAuthenticated } = await import('@/middlewares/auth');
    mockGetAuth.mockReturnValue({ userId: 'clerk_123' });
    mockFindUserByClerkId.mockResolvedValue({
      id: 'user-uuid',
      role: USER_ROLE.USER,
      status: USER_STATUS.INACTIVE,
    });

    await expect(requireAuthenticated(createMockRequest(), res, next)).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
      statusCode: StatusCodes.FORBIDDEN,
      message: ERROR_MESSAGES.INACTIVE_ACCOUNT,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.userId and req.userRole then calls next on success', async () => {
    const { requireAuthenticated } = await import('@/middlewares/auth');
    mockGetAuth.mockReturnValue({ userId: 'clerk_123' });
    mockFindUserByClerkId.mockResolvedValue({
      id: 'user-uuid',
      role: USER_ROLE.ADMIN,
      status: USER_STATUS.ACTIVE,
    });
    const req = createMockRequest();

    await requireAuthenticated(req, res, next);

    expect(req.userId).toBe('user-uuid');
    expect(req.userRole).toBe(USER_ROLE.ADMIN);
    expect(next).toHaveBeenCalledWith();
  });
});

describe('requireAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next with FORBIDDEN when userRole is not ADMIN', async () => {
    const { requireAdmin } = await import('@/middlewares/auth');
    const req = createMockRequest({ userRole: USER_ROLE.USER } as Partial<Request>);

    requireAdmin(req, res, next);

    expectNextCalledWithAppError(
      ErrorCode.FORBIDDEN,
      StatusCodes.FORBIDDEN,
      ERROR_MESSAGES.FORBIDDEN,
    );
  });

  it('calls next without error when userRole is ADMIN', async () => {
    const { requireAdmin } = await import('@/middlewares/auth');
    const req = createMockRequest({ userRole: USER_ROLE.ADMIN } as Partial<Request>);

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
