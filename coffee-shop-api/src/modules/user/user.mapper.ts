import { UserResponseSchema, type UserResponse } from './user.dto';
import { User } from './user.entity';

export const toResponse = (user: User): UserResponse =>
  UserResponseSchema.parse({
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
