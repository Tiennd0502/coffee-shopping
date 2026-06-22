export enum USER_ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum USER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id?: string
  deletedAt?: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  address?: {
    firstName: string | null
    lastName: string | null
    phoneNumber: string | null
    addressLine: string | null
    district: string | null
    ward: string | null
    city: string | null
    postalCode: string | null
    isDefault: boolean | null
  } | null
  name: string | null
  avatarUrl: string | null
  role?: USER_ROLES
  status?: USER_STATUS
}

export interface ClerkUser extends User {
  fullName: string | null
  imageUrl: string | null
  primaryEmailAddress?: { emailAddress: string } | null
}
