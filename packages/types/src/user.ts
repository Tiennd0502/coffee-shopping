export enum USER_ROLE {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum USER_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface UserAddress {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine: string;
  district: string;
  ward: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: USER_ROLE;
  status?: USER_STATUS;
  addresses?: UserAddress[];
  deletedAt?: string;
}
