export const ERROR_MESSAGES = {
  PROGRAMMING_OR_UNKNOWN: 'Programming or unknown error',
  INTERNAL_SERVER: 'Internal Server Error',
  INVALID_WEBHOOK_SIGNATURE: 'Invalid webhook signature',
  NOT_FOUND: (name: string) => `${name} not found`,
  FIELD_INVALID: (field: string) => `${field} is invalid`,
  CATEGORY_NAME_EXISTS: 'A category with that name already exists',
  EMAIL_EXISTS: 'An account with that email already exists',
  USER_CLERK_ID_TAKEN: 'That Clerk user id is already linked to another account',
  INVALID_REQUEST: 'Request validation failed',
  UNAUTHENTICATED: 'Authentication required',
  FORBIDDEN: 'Access forbidden',
  INACTIVE_ACCOUNT: 'Your account has been deactivated',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later.',

  ORDER: {
    USER_INACTIVE: 'Your account is not active and cannot place orders',
    ADDRESS_REQUIRED: 'Either addressId or shippingAddress must be provided',
    ADDRESS_NOT_FOUND: 'Address not found or does not belong to this user',
    SHIPPING_METHOD_NOT_FOUND: 'Shipping method not found or inactive',
    VARIANT_NOT_FOUND: (id: string): string => `Variant ${id} not found`,
    INSUFFICIENT_STOCK: (sku: string, available: number): string =>
      `Insufficient stock for variant ${sku}: ${available <= 0 ? 'out of stock' : `only ${String(available)} unit${available === 1 ? '' : 's'} available`}`,
    DUPLICATE_VARIANT: 'Duplicate variant found in order items',
    CANNOT_DELETE_ORDER: 'Only pending or cancelled orders can be deleted',
    INVALID_TRANSITION: (name: string, from: string, to: string): string =>
      `Cannot transition ${name} from ${from} to ${to}`,
  },

  PRODUCT: {
    SLUG_EXISTS: 'A product with that slug already exists',
    SKU_EXISTS: 'A product variant with that SKU already exists',
    DUPLICATE_SKU_IN_REQUEST: 'Duplicate SKU found in variants',
    MULTIPLE_PRIMARY_IMAGES: 'Only one primary image is allowed per product',
    DUPLICATE_IMAGE_IDS: 'Duplicate image ids found in request',
    OVERLAPPING_IMAGE_MUTATIONS: 'An image cannot be both removed and updated in the same request',
    INVALID_IMAGE_IDS: (ids: string[]): string =>
      `These image ids do not belong to this product: ${ids.join(', ')}`,
    TOO_MANY_IMAGES: (max: number): string => `A product can have at most ${String(max)} images`,
  },
};
