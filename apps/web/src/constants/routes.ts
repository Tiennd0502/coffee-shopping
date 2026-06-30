export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: (id: string) => `/order-success/${id}`,
  DASHBOARD: '/dashboard',
  DASHBOARD_PRODUCTS: '/dashboard/products',
  DASHBOARD_PRODUCTS_ADD: '/dashboard/products/add',
  DASHBOARD_PRODUCTS_EDIT: (id: string) => `/dashboard/products/${id}/edit`,
  DASHBOARD_CATEGORIES: '/dashboard/categories',
  DASHBOARD_CATEGORIES_ADD: '/dashboard/categories/add',
  DASHBOARD_CATEGORIES_EDIT: (id: string) => `/dashboard/categories/${id}/edit`,
  DASHBOARD_USERS: '/dashboard/users',
  DASHBOARD_USERS_ADD: '/dashboard/users/add',
  DASHBOARD_ORDERS: '/dashboard/orders',
  SIGN_IN: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
  SIGN_UP: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
  SIGN_UP_VERIFY: `${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up'}/verify`,
  USER_PROFILE: '/profile',
  ROASTS: '/roasts',
  ROASTS_DETAIL: (id: string) => `/roasts/${encodeURIComponent(id)}`,
};

export function dashboardCategoryEditRoute(categoryId: string): string {
  return `${ROUTES.DASHBOARD_CATEGORIES}/${encodeURIComponent(categoryId)}/edit`;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const API_ROUTES = {
  ME: `${API_BASE_URL}/api/v1/me`,
  USERS: `${API_BASE_URL}/api/v1/users`,
  CATEGORIES: `${API_BASE_URL}/api/v1/categories`,
  PRODUCTS: `${API_BASE_URL}/api/v1/products`,
  ORDERS: `${API_BASE_URL}/api/v1/orders`,
};
