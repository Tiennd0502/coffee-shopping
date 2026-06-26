import { z } from 'zod';

import { VALIDATION_RULES } from '@/shared/constants/validation';
import { USER_ROLE, USER_STATUS } from '@repo/types';

const { EMAIL, NAME, PHONE, PAGINATION, IMAGE } = VALIDATION_RULES;

const userStatus = z.enum(USER_STATUS);
const userRole = z.enum(USER_ROLE);
const idParam = z.string().uuid();

export const CreateUserSchema = z
  .object({
    email: z.string().min(EMAIL.MIN_LENGTH).max(EMAIL.MAX_LENGTH).email(),
    firstName: z.string().min(NAME.MIN_LENGTH).max(NAME.MAX_LENGTH).trim(),
    lastName: z.string().min(NAME.MIN_LENGTH).max(NAME.MAX_LENGTH).trim(),
    phoneNumber: z.string().max(PHONE.MAX_LENGTH).trim().optional(),
    clerkId: z.string().trim().optional(),
    avatarUrl: z.string().url().max(IMAGE.URL_MAX_LENGTH).optional(),
    status: userStatus.optional().default(USER_STATUS.ACTIVE),
    role: userRole.optional().default(USER_ROLE.USER),
  })
  .openapi('CreateUserInput');

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z
  .object({
    email: z.string().min(EMAIL.MIN_LENGTH).max(EMAIL.MAX_LENGTH).email().optional(),
    firstName: z.string().min(NAME.MIN_LENGTH).max(NAME.MAX_LENGTH).trim().optional(),
    lastName: z.string().min(NAME.MIN_LENGTH).max(NAME.MAX_LENGTH).trim().optional(),
    phoneNumber: z.string().max(PHONE.MAX_LENGTH).trim().nullish(),
    clerkId: z.string().trim().nullish(),
    avatarUrl: z.string().url().max(IMAGE.URL_MAX_LENGTH).optional(),
    status: userStatus.optional(),
    role: userRole.optional(),
  })
  .openapi('UpdateUserInput');

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UserResponseSchema = z
  .object({
    id: z.string().uuid(),
    clerkId: z.string().nullable(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    status: userStatus,
    role: userRole,
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
  })
  .openapi('UserResponse');

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const UserAddressResponseSchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    addressLine: z.string(),
    city: z.string(),
    district: z.string(),
    ward: z.string(),
    postalCode: z.string(),
    isDefault: z.boolean(),
  })
  .openapi('UserAddressResponse');

export type UserAddressResponse = z.infer<typeof UserAddressResponseSchema>;

export const UserMeResponseSchema = UserResponseSchema.extend({
  addresses: z.array(UserAddressResponseSchema),
}).openapi('UserMeResponse');

export type UserMeResponse = z.infer<typeof UserMeResponseSchema>;

export const ListUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  role: userRole.optional(),
  status: userStatus.optional(),
  search: z.string().trim().optional(),
});

export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

/** Path `/users/:id` */
export const userRecordIdParamSchema = z.object({ id: idParam });
