import { AppError } from '@/shared/errors/app';

export const getErrorLog = (err: unknown): Record<string, unknown> => {
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
  return {
    message: typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err),
  };
};

export const extractErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'object' && err !== null) {
    return JSON.stringify(err);
  }
  return String(err);
};
