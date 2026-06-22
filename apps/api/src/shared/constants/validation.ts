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
  CATEGORY_NAME: {
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
  SLUG: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 120,
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  PRODUCT: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 200,
    },
    IMAGE: {
      MAX_AVATARS_ALLOWED: 1,
      MAX_COUNT: 6,
      URL_MAX_LENGTH: 500,
    },
    DESCRIPTION: {
      MAX_LENGTH: 2000,
    },
    TASTING_NOTES: {
      MAX_LENGTH: 500,
    },
    ORIGIN: {
      MAX_LENGTH: 100,
    },
    PROCESSING_METHOD: {
      MAX_LENGTH: 100,
    },
    VARIANT: {
      SKU: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 100,
      },
    },
  },
  IMAGE: {
    URL_MAX_LENGTH: 500,
  },
  ADDRESS: {
    LINE: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 255,
    },
    CITY: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
    DISTRICT: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
    WARD: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
    POSTAL_CODE: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 20,
    },
  },
} as const;
