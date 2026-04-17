import type { Request } from 'express';

/**
 * Trusted, operational error the API can safely expose to clients (with a stable code and HTTP status).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public userId?: string;
  public method?: string;
  public url?: string;

  /**
   * @param message - Human-readable message (returned to clients for operational errors).
   * @param statusCode - HTTP status code.
   * @param options - Optional machine-readable `code` and operational flag.
   */
  constructor(
    message: string,
    statusCode: number,
    options?: { code?: string; isOperational?: boolean },
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options?.code ?? `HTTP_${String(statusCode)}`;
    this.isOperational = options?.isOperational ?? true;
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
