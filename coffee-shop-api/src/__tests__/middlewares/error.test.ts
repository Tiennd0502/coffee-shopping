import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ErrorCode } from '@/shared/errors/codes';
import {
  INTERNAL_SERVER_ERROR_MESSAGE,
  PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE,
} from '@/shared/errors/messages';

const mockWarn = jest.fn();
const mockError = jest.fn();

jest.mock('@/config/logger', () => ({
  logger: {
    warn: mockWarn,
    error: mockError,
  },
}));

type MockResponse = Pick<Response, 'status' | 'json'>;

const createMockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    method: 'GET',
    originalUrl: '/orders',
    requestId: 'req-123',
    userId: 'user-123',
    ...overrides,
  }) as Request;

const createMockResponse = (): {
  readonly res: MockResponse;
  readonly status: jest.MockedFunction<(code: number) => MockResponse>;
  readonly json: jest.MockedFunction<(body: unknown) => MockResponse>;
} => {
  const res = {} as MockResponse;
  const status = jest.fn<MockResponse, [number]>().mockReturnValue(res);
  const json = jest.fn<MockResponse, [unknown]>().mockReturnValue(res);

  Object.assign(res, { status, json });

  return { res, status, json };
};

const next = jest.fn() as jest.MockedFunction<NextFunction>;

describe('errorHandlerMiddleware', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('returns the operational app error payload and warning log', async () => {
    const { errorHandlerMiddleware } = await import('@/middlewares/error');
    const { AppError } = await import('@/shared/errors/app');
    const req = createMockRequest();
    const { res, status, json } = createMockResponse();
    const err = new AppError('Order not found', StatusCodes.NOT_FOUND, {
      code: ErrorCode.NOT_FOUND,
    });

    errorHandlerMiddleware(err, req, res as Response, next);

    expect(mockWarn).toHaveBeenCalledWith('Operational error', {
      requestId: 'req-123',
      message: 'Order not found',
      code: ErrorCode.NOT_FOUND,
      statusCode: StatusCodes.NOT_FOUND,
      userId: 'user-123',
      method: 'GET',
      url: '/orders',
    });
    expect(mockError).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      status: StatusCodes.NOT_FOUND,
      message: 'Order not found',
      code: ErrorCode.NOT_FOUND,
      requestId: 'req-123',
    });
  });

  it('returns the raw error message for unknown errors outside production', async () => {
    const { errorHandlerMiddleware } = await import('@/middlewares/error');
    const req = createMockRequest({ requestId: undefined, userId: undefined });
    const { res, status, json } = createMockResponse();
    const err = new Error('Database connection failed');

    errorHandlerMiddleware(err, req, res as Response, next);

    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockError).toHaveBeenCalledWith(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, {
      requestId: undefined,
      message: 'Database connection failed',
      stack: expect.any(String),
      name: 'Error',
    });
    expect(status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Database connection failed',
      code: ErrorCode.INTERNAL_ERROR,
    });
  });

  it('hides unknown error details in production', async () => {
    process.env.NODE_ENV = 'production';
    const { errorHandlerMiddleware } = await import('@/middlewares/error');
    const req = createMockRequest();
    const { res, status, json } = createMockResponse();
    const err = new Error('Sensitive database failure');

    errorHandlerMiddleware(err, req, res as Response, next);

    expect(mockError).toHaveBeenCalledWith(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, {
      requestId: 'req-123',
      message: 'Sensitive database failure',
      stack: expect.any(String),
      name: 'Error',
    });
    expect(status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: INTERNAL_SERVER_ERROR_MESSAGE,
      code: ErrorCode.INTERNAL_ERROR,
      requestId: 'req-123',
    });
  });
});
