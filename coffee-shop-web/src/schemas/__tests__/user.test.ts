import { ERROR_MESSAGES } from '@/constants/messages'
import {
  parseSignInCredentialsForm,
  parseSignUpStartForm,
} from '@/schemas/user'

const toSignInFormData = (identifier: string, password: string): FormData => {
  const fd = new FormData()
  fd.set('identifier', identifier)
  fd.set('password', password)
  return fd
}

describe('parseSignInCredentialsForm', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = parseSignInCredentialsForm(
      toSignInFormData('user@example.com', 'secret'),
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.identifier).toBe('user@example.com')
      expect(result.data.password).toBe('secret')
    }
  })

  it('rejects an invalid email', () => {
    const result = parseSignInCredentialsForm(
      toSignInFormData('not-an-email', 'secret'),
    )
    expect(result.success).toBe(false)
  })

  it('rejects empty fields', () => {
    const result = parseSignInCredentialsForm(toSignInFormData('', ''))
    expect(result.success).toBe(false)
  })
})

const fullStartForm = (
  firstName: string,
  lastName: string,
  emailAddress: string,
  password: string,
): FormData => {
  const fd = new FormData()
  fd.set('firstName', firstName)
  fd.set('lastName', lastName)
  fd.set('emailAddress', emailAddress)
  fd.set('password', password)
  return fd
}

describe('parseSignUpStartForm', () => {
  it('accepts valid profile, email, and password', () => {
    const result = parseSignUpStartForm(
      fullStartForm('Ada', 'Lovelace', 'user@example.com', 'password1'),
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.firstName).toBe('Ada')
      expect(result.data.lastName).toBe('Lovelace')
      expect(result.data.emailAddress).toBe('user@example.com')
      expect(result.data.password).toBe('password1')
    }
  })

  it('rejects empty profile or credentials', () => {
    expect(parseSignUpStartForm(fullStartForm('', '', '', '')).success).toBe(
      false,
    )
  })

  it('rejects an invalid email', () => {
    const result = parseSignUpStartForm(
      fullStartForm('Ada', 'Lovelace', 'not-an-email', 'password1'),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === ERROR_MESSAGES.EMAIL_ADDRESS_INVALID,
        ),
      ).toBe(true)
    }
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = parseSignUpStartForm(
      fullStartForm('Ada', 'Lovelace', 'user@example.com', 'short'),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === ERROR_MESSAGES.PASSWORD_MIN_LENGTH,
        ),
      ).toBe(true)
    }
  })

  it('rejects empty first or last name', () => {
    expect(
      parseSignUpStartForm(
        fullStartForm('', 'Lovelace', 'user@example.com', 'password1'),
      ).success,
    ).toBe(false)
    expect(
      parseSignUpStartForm(
        fullStartForm('Ada', '', 'user@example.com', 'password1'),
      ).success,
    ).toBe(false)
  })
})
