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

interface TestRequest extends Request {
  requestId?: string;
  userId?: string;
}

type MockResponse = Pick<Response, 'status' | 'json' | 'headersSent'>;

const createMockRequest = (overrides: Partial<TestRequest> = {}): TestRequest =>
  ({
    method: 'GET',
    originalUrl: '/orders',
    requestId: 'req-123',
    userId: 'user-123',
    ...overrides,
  }) as TestRequest;

const createMockResponse = (): {
  readonly res: MockResponse;
  readonly status: jest.MockedFunction<(code: number) => MockResponse>;
  readonly json: jest.MockedFunction<(body: unknown) => MockResponse>;
} => {
  const res = {} as MockResponse;
  const status = jest.fn<MockResponse, [number]>().mockReturnValue(res);
  const json = jest.fn<MockResponse, [unknown]>().mockReturnValue(res);

  Object.assign(res, { status, json, headersSent: false });

  return { res, status, json };
};

const next = jest.fn() as jest.MockedFunction<NextFunction>;
const expectNoNextCall = (): void => {
  expect(next).not.toHaveBeenCalled();
};

describe('errorHandlerMiddleware', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    next.mockClear();
    jest.resetModules();
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('operational AppError', () => {
    it('returns error payload with requestId and logs a warning', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const { AppError } = await import('@/shared/errors/app');
      const req = createMockRequest();
      const { res, status, json } = createMockResponse();
      const err = new AppError('Order not found', StatusCodes.NOT_FOUND, {
        code: ErrorCode.NOT_FOUND,
      });

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).toHaveBeenCalledTimes(1);
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
      expectNoNextCall();
    });

    it('omits requestId from response when request has no requestId', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const { AppError } = await import('@/shared/errors/app');
      const req = createMockRequest({ requestId: undefined });
      const { res, status, json } = createMockResponse();
      const err = new AppError('Unauthorized', StatusCodes.UNAUTHORIZED, {
        code: ErrorCode.UNAUTHORIZED,
      });

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).toHaveBeenCalledTimes(1);
      expect(mockError).not.toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(json).toHaveBeenCalledWith({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Unauthorized',
        code: ErrorCode.UNAUTHORIZED,
      });
      expectNoNextCall();
    });

    it('uses the default AppError code when no explicit code is provided', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const { AppError } = await import('@/shared/errors/app');
      const req = createMockRequest();
      const { res, status, json } = createMockResponse();
      const err = new AppError('Oops', StatusCodes.BAD_REQUEST);

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).toHaveBeenCalledTimes(1);
      expect(mockWarn).toHaveBeenCalledWith('Operational error', {
        requestId: 'req-123',
        message: 'Oops',
        code: 'HTTP_400',
        statusCode: StatusCodes.BAD_REQUEST,
        userId: 'user-123',
        method: 'GET',
        url: '/orders',
      });
      expect(mockError).not.toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(json).toHaveBeenCalledWith({
        status: StatusCodes.BAD_REQUEST,
        message: 'Oops',
        code: 'HTTP_400',
        requestId: 'req-123',
      });
      expectNoNextCall();
    });
  });

  describe('non-operational AppError', () => {
    it('treats it as a programming error and logs extended AppError fields', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const { AppError } = await import('@/shared/errors/app');
      const req = createMockRequest();
      const { res, status, json } = createMockResponse();
      const err = new AppError('Unexpected internal state', StatusCodes.INTERNAL_SERVER_ERROR, {
        code: ErrorCode.INTERNAL_ERROR,
        isOperational: false,
      });

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, {
        requestId: 'req-123',
        message: 'Unexpected internal state',
        stack: expect.any(String),
        name: 'AppError',
        code: ErrorCode.INTERNAL_ERROR,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isOperational: false,
        userId: 'user-123',
        method: 'GET',
        url: '/orders',
      });
      expect(status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Unexpected internal state',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: 'req-123',
      });
      expectNoNextCall();
    });
  });

  describe('unknown Error', () => {
    it('exposes the raw error message in development', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const req = createMockRequest({ requestId: undefined, userId: undefined });
      const { res, status, json } = createMockResponse();
      const err = new Error('Database connection failed');

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, {
        requestId: undefined,
        method: 'GET',
        url: '/orders',
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
      expectNoNextCall();
    });

    it('hides error details in production', async () => {
      process.env.NODE_ENV = 'production';
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const req = createMockRequest();
      const { res, status, json } = createMockResponse();
      const err = new Error('Sensitive database failure');

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, {
        requestId: 'req-123',
        method: 'GET',
        url: '/orders',
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
      expectNoNextCall();
    });

    it('handles Error with empty message safely', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const req = createMockRequest();
      const { res, status, json } = createMockResponse();
      const err = new Error();

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, {
        requestId: 'req-123',
        method: 'GET',
        url: '/orders',
        message: '',
        stack: expect.any(String),
        name: 'Error',
      });
      expect(status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: 'req-123',
      });
      expectNoNextCall();
    });

    it('delegates to next when headers were already sent', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const req = createMockRequest();
      const { res, status, json } = createMockResponse();
      const err = new Error('Late error');

      res.headersSent = true;

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(next).toHaveBeenCalledWith(err);
      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
      expect(json).not.toHaveBeenCalled();
    });
  });

  describe('non-Error thrown value', () => {
    it('handles a thrown string and exposes it as the error message', async () => {
      const { errorHandlerMiddleware } = await import('@/middlewares/error');
      const req = createMockRequest();
      const { res, status, json } = createMockResponse();
      const err = 'Something went catastrophically wrong';

      errorHandlerMiddleware(err, req, res as Response, next);

      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, {
        requestId: 'req-123',
        method: 'GET',
        url: '/orders',
        message: 'Something went catastrophically wrong',
      });
      expect(status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Something went catastrophically wrong',
        code: ErrorCode.INTERNAL_ERROR,
        requestId: 'req-123',
      });
      expectNoNextCall();
    });
  });
});
