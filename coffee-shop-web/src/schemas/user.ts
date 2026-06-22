import { z } from 'zod'

import { ERROR_MESSAGES } from '@/constants/messages'
import { formDataEntryToString } from '@/utils/validation'

export const signInCredentialsSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.IDENTIFIER_REQUIRED)
    .email(ERROR_MESSAGES.IDENTIFIER_EMAIL_INVALID),
  password: z.string().trim().min(1, ERROR_MESSAGES.PASSWORD_REQUIRED),
})

export type SignInCredentialsValues = z.infer<typeof signInCredentialsSchema>

export const parseSignInCredentialsForm = (formData: FormData) =>
  signInCredentialsSchema.safeParse({
    identifier: formDataEntryToString(formData.get('identifier')),
    password: formDataEntryToString(formData.get('password')),
  })

export const signUpStartSchema = z.object({
  firstName: z.string().trim().min(1, ERROR_MESSAGES.FIRST_NAME_REQUIRED),
  lastName: z.string().trim().min(1, ERROR_MESSAGES.LAST_NAME_REQUIRED),
  emailAddress: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.EMAIL_ADDRESS_REQUIRED)
    .email(ERROR_MESSAGES.EMAIL_ADDRESS_INVALID),
  password: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.PASSWORD_REQUIRED)
    .min(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH),
})

export type SignUpStartValues = z.infer<typeof signUpStartSchema>

export const parseSignUpStartForm = (formData: FormData) =>
  signUpStartSchema.safeParse({
    firstName: formDataEntryToString(formData.get('firstName')),
    lastName: formDataEntryToString(formData.get('lastName')),
    emailAddress: formDataEntryToString(formData.get('emailAddress')),
    password: formDataEntryToString(formData.get('password')),
  })
