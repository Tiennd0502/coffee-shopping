export const ERROR_MESSAGES = {
  PROGRAMMING_OR_UNKNOWN: 'Programming or unknown error',
  INTERNAL_SERVER: 'Internal Server Error',
  INVALID_WEBHOOK_SIGNATURE: 'Invalid webhook signature',
  NOT_FOUND: (name: string) => `${name} not found`,
  EMAIL_EXISTS: 'An account with that email already exists',
  USER_CLERK_ID_TAKEN: 'That Clerk user id is already linked to another account',
  INVALID_REQUEST: 'Request validation failed',
  UNAUTHENTICATED: 'Authentication required',
  INACTIVE_ACCOUNT: 'Your account has been deactivated',
};
