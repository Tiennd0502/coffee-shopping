import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

// Config
import { logger } from '@/config/logger';

// Shared
import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import {
  INTERNAL_SERVER_ERROR_MESSAGE,
  PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE,
} from '@/shared/errors/messages';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Maps any thrown value to a consistent JSON error shape and appropriate logging.
 * Operational {@link AppError} instances return their status and message; unknown errors are treated as programming bugs.
 */
export const errorHandlerMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express requires a 4-arg signature.
  _next,
) => {
  if (err instanceof AppError) {
    err.attachRequestContext(req);
  }

  if (err instanceof AppError && err.isOperational) {
    logger.warn('Operational error', {
      requestId: req.requestId,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      userId: err.userId,
      method: err.method,
      url: err.url,
    });

    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      code: err.code,
      ...(req.requestId ? { requestId: req.requestId } : {}),
    });
    return;
  }

  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const logPayload = buildProgrammingErrorLog(err);

  logger.error(PROGRAMMING_OR_UNKNOWN_ERROR_MESSAGE, { requestId: req.requestId, ...logPayload });

  res.status(statusCode).json({
    status: statusCode,
    message: isProduction ? INTERNAL_SERVER_ERROR_MESSAGE : extractErrorMessage(err),
    code: ErrorCode.INTERNAL_ERROR,
    ...(req.requestId ? { requestId: req.requestId } : {}),
  });
};

const buildProgrammingErrorLog = (err: unknown): Record<string, unknown> => {
  if (err instanceof AppError) {
    return {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      userId: err.userId,
      method: err.method,
      url: err.url,
    };
  }
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack, name: err.name };
  }
  return { message: String(err) };
};

const extractErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
};
