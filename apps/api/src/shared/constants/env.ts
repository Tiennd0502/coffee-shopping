export const MIN_ENV_LENGTH = 1;

export const DEFAULT_PORT = 3000;
export const DEFAULT_DB_PORT = 5432;

export const DEFAULT_RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute
export const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export const NODE_ENV_VALUES = ['development', 'production', 'test'] as const;
export const DEFAULT_NODE_ENV = 'development';

export const ENV_ERRORS = {
  DB_HOST_REQUIRED: 'DB_HOST is required',
  DB_NAME_REQUIRED: 'DB_NAME is required',
  DB_USER_REQUIRED: 'DB_USER is required',
  DB_PASSWORD_REQUIRED: 'DB_PASSWORD is required',
  CLERK_WEBHOOK_SECRET_REQUIRED: 'CLERK_WEBHOOK_SECRET is required',
  CLERK_SECRET_KEY_REQUIRED: 'CLERK_SECRET_KEY is required',
} as const;
