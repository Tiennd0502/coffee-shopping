import { z } from 'zod'

import { ERROR_MESSAGES } from '@/constants/messages'
import { formDataEntryToString } from '@/utils/validation'
import { VALIDATION_RULES } from '@/constants/validation'

const { CATEGORY_NAME } = VALIDATION_RULES

export const createCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CATEGORY_NAME.MIN_LENGTH, { message: ERROR_MESSAGES.FIELD_REQUIRED })
    .max(CATEGORY_NAME.MAX_LENGTH, {
      message: ERROR_MESSAGES.CATEGORY_NAME_MAX,
    }),
})

export type CreateCategoryFormValues = z.infer<typeof createCategoryFormSchema>

export const parseCreateCategoryForm = (formData: FormData) =>
  createCategoryFormSchema.safeParse({
    name: formDataEntryToString(formData.get('name')),
  })
