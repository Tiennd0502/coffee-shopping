import {
  UserMeResponseSchema,
  UserResponseSchema,
  type UserMeResponse,
  type UserResponse,
} from './user.dto';
import { UserAddress } from './user-address.entity';
import { User } from './user.entity';

export const toResponse = (user: User): UserResponse =>
  UserResponseSchema.parse({
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });

export const toMeResponse = (user: User, addresses: UserAddress[]): UserMeResponse =>
  UserMeResponseSchema.parse({
    ...toResponse(user),
    addresses: addresses.map((a) => ({
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      phoneNumber: a.phoneNumber,
      addressLine: a.addressLine,
      city: a.city,
      district: a.district,
      ward: a.ward,
      postalCode: a.postalCode,
      isDefault: a.isDefault,
    })),
  });
