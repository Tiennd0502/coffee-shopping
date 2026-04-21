export const VALIDATION_RULES = {
  TEXT: {
    MIN_NON_EMPTY_LENGTH: 1,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 254,
  },
  PHONE: {
    MAX_LENGTH: 20,
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
} as const;
