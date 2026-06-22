import { z } from 'zod'

import { ERROR_MESSAGES } from '@/constants/messages'
import { DISCOUNT_TYPE, PRODUCT_UNIT, ROAST_LEVEL } from '@/types/product'

const nonNegativeNumber = (field: string) =>
  z
    .number({ error: field })
    .refine((value) => Number.isFinite(value) && value >= 0, {
      message: field,
    })

const greaterThanZeroNumber = (message: string) =>
  z
    .number({ error: ERROR_MESSAGES.FIELD_REQUIRED })
    .refine((value) => Number.isFinite(value) && value > 0, {
      message,
    })

export const createProductFormSchema = z
  .object({
    categoryId: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    name: z.string().trim().min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    description: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    roastLevel: z.nativeEnum(ROAST_LEVEL),
    isOrganic: z.boolean(),
    isFairTrade: z.boolean(),
    weight: greaterThanZeroNumber('Weight must be greater than 0'),
    unit: z
      .union([z.literal(''), z.nativeEnum(PRODUCT_UNIT)], {
        error: ERROR_MESSAGES.FIELD_REQUIRED,
      })
      .refine((value) => value !== '', {
        message: ERROR_MESSAGES.FIELD_REQUIRED,
      }),
    price: greaterThanZeroNumber('Base price must be greater than 0'),
    discountType: z.nativeEnum(DISCOUNT_TYPE),
    discountValue: nonNegativeNumber(ERROR_MESSAGES.DISCOUNT_PERCENT_MIN),
    quantity: z
      .number({ error: ERROR_MESSAGES.FIELD_REQUIRED })
      .int({ message: 'Quantity must be a whole number' })
      .min(1, { message: 'Quantity must be at least 1' }),
    origin: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
    processingMethod: z
      .string()
      .trim()
      .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
  })
  .superRefine((data, ctx) => {
    if (
      data.discountType === DISCOUNT_TYPE.PERCENT &&
      data.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: ERROR_MESSAGES.DISCOUNT_PERCENT_MAX,
      })
    }

    if (
      data.discountType === DISCOUNT_TYPE.FIXED &&
      data.discountValue >= data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: ERROR_MESSAGES.DISCOUNT_FIXED_MUST_BE_LESS_THAN_PRICE,
      })
    }
  })

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>

export const editProductFormSchema = z.object({
  categoryId: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
  name: z.string().trim().min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
  description: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
  roastLevel: z.nativeEnum(ROAST_LEVEL),
  isOrganic: z.boolean(),
  isFairTrade: z.boolean(),
  origin: z.string().trim().min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
  processingMethod: z
    .string()
    .trim()
    .min(1, { message: ERROR_MESSAGES.FIELD_REQUIRED }),
})

export type EditProductFormValues = z.infer<typeof editProductFormSchema>
