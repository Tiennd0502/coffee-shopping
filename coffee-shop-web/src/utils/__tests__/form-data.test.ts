import { formDataEntryToString } from '@/utils/validation'

describe('formDataEntryToString', () => {
  it('returns empty string for null', () => {
    expect(formDataEntryToString(null)).toBe('')
  })

  it('returns string values unchanged', () => {
    expect(formDataEntryToString('hello')).toBe('hello')
    expect(formDataEntryToString('')).toBe('')
  })

  it('returns empty string for File entries', () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' })
    expect(formDataEntryToString(file)).toBe('')
  })
})
