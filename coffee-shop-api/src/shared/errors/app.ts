import type { Request } from 'express';

interface ErrorItem {
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
