export const DEFAULT_PORT = 3000;
export const DEFAULT_DB_PORT = 5432;

export const NODE_ENV_VALUES = ['development', 'production', 'test'] as const;
export const DEFAULT_NODE_ENV = 'development';

export const ENV_ERRORS = {
  DB_HOST_REQUIRED: 'DB_HOST is required',
  DB_NAME_REQUIRED: 'DB_NAME is required',
  DB_USER_REQUIRED: 'DB_USER is required',
  DB_PASSWORD_REQUIRED: 'DB_PASSWORD is required',
  CLERK_WEBHOOK_SECRET_REQUIRED: 'CLERK_WEBHOOK_SECRET is required',
} as const;
