export const ERROR_MESSAGES = {
  IDENTIFIER_REQUIRED: 'Enter your email address',
  IDENTIFIER_EMAIL_INVALID: 'Enter a valid email address',
  PASSWORD_REQUIRED: 'Enter your password',
  EMAIL_ADDRESS_REQUIRED: 'Enter your email address',
  EMAIL_ADDRESS_INVALID: 'Enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  FIRST_NAME_REQUIRED: 'Enter your first name',
  LAST_NAME_REQUIRED: 'Enter your last name',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  SIGN_OUT_FAILED: 'Logout failed. Something went wrong.',
  UNEXPECTED_PROFILE_RESPONSE: 'Unexpected profile response',
  NETWORK_ERROR: 'Network error',
  FIELD_REQUIRED: 'This field is required',
  CATEGORY_NAME_MAX: 'Name must be at most 120 characters',
  DISCOUNT_PERCENT_MIN: 'Discount cannot be less than 0%',
  DISCOUNT_PERCENT_MAX: 'Discount cannot exceed 100%',
  DISCOUNT_FIXED_MUST_BE_LESS_THAN_PRICE:
    'Fixed discount must be less than base price',
  IMAGE_UPLOAD_NOT_CONFIGURED: 'Image upload is not configured',
  PRODUCT_AVATAR_REQUIRED: 'Main hero image is required',
  PRODUCT_GALLERY_REQUIRED: 'At least one gallery image is required',
  ADDRESS_REQUIRED: 'Enter your delivery address',
  PHONE_NUMBER_REQUIRED: 'Enter your phone number',
  CITY_REQUIRED: 'Enter your city',
  DISTRICT_REQUIRED: 'Enter your district',
  WARD_REQUIRED: 'Enter your ward',
  POSTAL_CODE_REQUIRED: 'Enter your postal code',
  CARD_NUMBER_REQUIRED: 'Enter your card number',
  CARD_NUMBER_INVALID: 'Enter a valid card number',
  EXPIRY_DATE_REQUIRED: 'Enter your expiry date',
  EXPIRY_DATE_INVALID: 'Enter expiry date as MM/YY',
  CVC_REQUIRED: 'Enter your CVC',
  CVC_INVALID: 'Enter a valid CVC',
} as const

export const API_FALLBACK_ERRORS = {
  CATEGORY_CREATE: 'Could not create category',
  CATEGORY_DELETE: 'Could not delete category',
  CATEGORY_LOAD: 'Could not load category',
  CATEGORY_UPDATE: 'Could not update category',
  CATEGORIES_LOAD: 'Could not load categories',
  PRODUCT_CREATE: 'Could not create product',
  PRODUCT_DELETE: 'Could not delete product',
  PRODUCT_LOAD: 'Could not load product',
  PRODUCT_UPDATE: 'Could not update product',
  PRODUCTS_LOAD: 'Could not load products',
  IMAGE_UPLOAD: 'Could not upload image',
  USERS_LOAD: 'Could not load users',
  USER_DELETE: 'Could not delete user',
  USER_UPDATE: 'Could not update user',
  PROFILE_LOAD: 'Could not load profile',
  ORDER_CREATE: 'Could not place order',
  ORDER_DELETE: 'Could not delete order',
  ORDER_STATUS_UPDATE: 'Could not update order status',
  ORDER_SHIPPING_STATUS_UPDATE: 'Could not update shipping status',
  ORDERS_LOAD: 'Could not load orders',
} as const

export const SUCCESS_MESSAGES = {
  SIGNED_OUT: 'Signed out successfully',
  CATEGORY_CREATED: 'Category created',
  CATEGORY_UPDATED: 'Category updated',
  CATEGORY_DELETED: 'Category removed',
  PRODUCT_CREATED: 'Product created',
  PRODUCT_UPDATED: 'Product updated',
  PRODUCT_DELETED: 'Product removed',
  ORDER_DELETED: 'Order removed',
  ORDER_STATUS_UPDATED: 'Order status updated',
  ORDER_SHIPPING_STATUS_UPDATED: 'Shipping status updated',
  USER_ROLE_UPDATED: 'User role updated',
  USER_DELETED: 'User removed',
  DRAFT_DISCARDED: 'Draft discarded',
}

export const DIALOG_MESSAGES = {
  CATEGORY: {
    DELETE: {
      ACTION: 'Remove',
      DESCRIPTION: (name: string, slug: string) =>
        `This will remove ${name} (${slug}). It may still appear in this list with the Removed badge.`,
    },
  },
  PRODUCT: {
    DELETE: {
      ACTION: 'Delete Product',
      DESCRIPTION:
        'Are you sure you want to delete this product? This action cannot be undone.',
    },
  },
  ORDER: {
    DELETE: {
      ACTION: 'Delete order',
      DESCRIPTION: (orderLabel: string) =>
        `Are you sure you want to delete order ${orderLabel}? This action cannot be undone.`,
    },
  },
  USER: {
    DELETE: {
      ACTION: 'Delete user',
      DESCRIPTION: (userLabel: string) =>
        `Are you sure you want to delete ${userLabel}? This action cannot be undone.`,
    },
  },
}
