import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

// Config
import { isProduction } from '@/config/env';
import { logger } from '@/config/logger';

// Shared
import { AppError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';
import { ERROR_MESSAGES } from '@/shared/errors/messages';
import { getErrorLog, extractErrorMessage } from '@/shared/errors/utils';

/**
 * Maps any thrown value to a consistent JSON error shape and appropriate logging.
 * Operational {@link AppError} instances return their status and message; unknown errors are treated as programming bugs.
 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    err.attachRequestContext(req);

    if (err.isOperational) {
      logger.warn('Operational error', {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        userId: err.userId,
        method: err.method,
        url: err.url,
      });

      const safeStatusCode =
        err.statusCode >= StatusCodes.BAD_REQUEST &&
        err.statusCode < StatusCodes.INTERNAL_SERVER_ERROR
          ? err.statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      res.status(safeStatusCode).json({
        statusCode: safeStatusCode,
        message: err.message,
        ...(err.errors && { errors: err.errors }),
      });
      return;
    }
  }

  const logPayload = getErrorLog(err);

  // Include method/url for all programming errors so logs have full request context.
  logger.error(ERROR_MESSAGES.PROGRAMMING_OR_UNKNOWN, {
    method: req.method,
    url: req.originalUrl,
    ...logPayload,
  });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: isProduction ? ERROR_MESSAGES.INTERNAL_SERVER : extractErrorMessage(err),
    code: ErrorCode.INTERNAL_ERROR,
  });
};
