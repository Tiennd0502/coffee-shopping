import type { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ERROR_MESSAGES } from './messages';
import { ErrorCode } from './codes';

export interface ErrorItem {
  errCode: string;
  field: string;
  message: string;
  description: string;
}

/**
 * Trusted, operational error the API can safely expose to clients (with a stable code and HTTP status).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly errors?: ErrorItem[];
  public userId?: string;
  public method?: string;
  public url?: string;

  /**
   * @param message - Human-readable message (returned to clients for operational errors).
   * @param statusCode - HTTP status code.
   * @param options - Optional machine-readable `code` and operational flag.
   * @param errors - Optional array of error details for validation errors or similar cases where multiple issues should be reported in a single response.
   */
  constructor(
    message: string,
    statusCode: number,
    options?: { code?: string; isOperational?: boolean; errors?: ErrorItem[] },
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options?.code ?? `HTTP_${String(statusCode)}`;
    this.isOperational = options?.isOperational ?? true;
    this.errors = options?.errors;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Binds request metadata for logging and observability.
   */
  attachRequestContext(req: Request): this {
    this.method = req.method;
    this.url = req.originalUrl ?? req.url;
    this.userId = req.userId;
    return this;
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(ERROR_MESSAGES.UNAUTHENTICATED, StatusCodes.UNAUTHORIZED, {
      code: ErrorCode.UNAUTHORIZED,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, StatusCodes.FORBIDDEN, {
      code: ErrorCode.FORBIDDEN,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(name: string) {
    super(ERROR_MESSAGES.NOT_FOUND(name), StatusCodes.NOT_FOUND, {
      code: ErrorCode.NOT_FOUND,
    });
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: ErrorItem[]) {
    super(message, StatusCodes.BAD_REQUEST, {
      code: ErrorCode.BAD_REQUEST,
      errors,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT, {
      code: ErrorCode.CONFLICT,
    });
  }
}

export class TooManyRequestsError extends AppError {
  constructor() {
    super(ERROR_MESSAGES.TOO_MANY_REQUESTS, StatusCodes.TOO_MANY_REQUESTS, {
      code: ErrorCode.TOO_MANY_REQUESTS,
    });
  }
}
