/**
 * Machine-readable error codes returned in API responses.
 * Use these constants to avoid magic strings across the codebase.
 */
export const ErrorCode = {
  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Auth
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
