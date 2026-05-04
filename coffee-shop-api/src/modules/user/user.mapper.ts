import {
  UserMeResponseSchema,
  UserResponseSchema,
  type UserMeResponse,
  type UserResponse,
} from './user.dto';
import type { UserAddress } from './user-address.entity';
import type { User } from './user.entity';

export class UserMapper {
  static toResponse(user: User): UserResponse {
    return UserResponseSchema.parse({
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
  }

  static toMeResponse(user: User, addresses: UserAddress[]): UserMeResponse {
    return UserMeResponseSchema.parse({
      ...UserMapper.toResponse(user),
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
  }
}
