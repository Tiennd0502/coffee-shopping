/**
 * Machine-readable error codes returned in API responses.
 * Use these constants to avoid magic strings across the codebase.
 */
export const ErrorCode = {
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
