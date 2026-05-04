import { z } from 'zod';

import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from '@/shared/enums/order';
import { VALIDATION_RULES } from '@/shared/constants';

export const CreateOrderItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;

export const CreateOrderAddressSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  lastName: z
    .string()
    .trim()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  phoneNumber: z.string().trim().max(VALIDATION_RULES.PHONE.MAX_LENGTH),
  addressLine: z
    .string()
    .trim()
    .min(VALIDATION_RULES.ADDRESS.LINE.MIN_LENGTH)
    .max(VALIDATION_RULES.ADDRESS.LINE.MAX_LENGTH),
  city: z
    .string()
    .trim()
    .min(VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH)
    .max(VALIDATION_RULES.ADDRESS.CITY.MAX_LENGTH),
  district: z.string().trim().max(VALIDATION_RULES.ADDRESS.DISTRICT.MAX_LENGTH).optional(),
  ward: z.string().trim().max(VALIDATION_RULES.ADDRESS.WARD.MAX_LENGTH).optional(),
  postalCode: z.string().trim().max(VALIDATION_RULES.ADDRESS.POSTAL_CODE.MAX_LENGTH).optional(),
});

export type CreateOrderAddressInput = z.infer<typeof CreateOrderAddressSchema>;

export const CreateOrderSchema = z.object({
  shippingAddress: CreateOrderAddressSchema,
  shippingMethodId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PAYMENT_METHOD),
  note: z.string().trim().optional(),
  items: z.array(CreateOrderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const orderIdParamSchema = z.object({ id: z.string().uuid() });

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(ORDER_STATUS),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

export const UpdateShippingStatusSchema = z.object({
  shippingStatus: z.nativeEnum(SHIPPING_STATUS),
});

export type UpdateShippingStatusInput = z.infer<typeof UpdateShippingStatusSchema>;

export const ListOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(VALIDATION_RULES.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(VALIDATION_RULES.PAGINATION.MAX_LIMIT)
    .default(VALIDATION_RULES.PAGINATION.DEFAULT_LIMIT),
  status: z.nativeEnum(ORDER_STATUS).optional(),
  shippingStatus: z.nativeEnum(SHIPPING_STATUS).optional(),
  search: z.string().trim().optional(),
});

export type ListOrdersQuery = z.infer<typeof ListOrdersQuerySchema>;

const AddressSnapshotSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  addressLine: z.string(),
  city: z.string(),
  district: z.string().nullable(),
  ward: z.string().nullable(),
  postalCode: z.string().nullable(),
});

export const OrderItemResponseSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  discountAmount: z.number(),
  finalPrice: z.number(),
  subTotal: z.number(),
  productName: z.string(),
  productImage: z.string().nullable(),
  variantName: z.string(),
});

export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>;

const OrderUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  user: OrderUserResponseSchema.nullable(),
  orderNumber: z.string(),
  shippingMethodId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PAYMENT_METHOD),
  status: z.nativeEnum(ORDER_STATUS),
  shippingStatus: z.nativeEnum(SHIPPING_STATUS),
  paymentStatus: z.nativeEnum(PAYMENT_STATUS),
  subTotal: z.number(),
  tax: z.number(),
  shippingFee: z.number(),
  totalAmount: z.number(),
  shippingMethodName: z.string(),
  addressSnapshot: AddressSnapshotSchema,
  note: z.string().nullable(),
  items: z.array(OrderItemResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;
