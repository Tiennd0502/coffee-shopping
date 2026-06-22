import {
  formatUserListEmailForDisplay,
  formatPrice,
  getNameInitials,
} from '../common'

describe('formatPrice', () => {
  it('formats en-US USD with two fraction digits', () => {
    expect(formatPrice(15, 'en-US', 'USD')).toBe('$15.00')
    expect(formatPrice(45, 'en-US', 'USD')).toBe('$45.00')
  })

  it('formats zero', () => {
    expect(formatPrice(0, 'en-US', 'USD')).toBe('$0.00')
  })

  it('rounds to two decimal places', () => {
    expect(formatPrice(15.2, 'en-US', 'USD')).toBe('$15.20')
    expect(formatPrice(15.999, 'en-US', 'USD')).toBe('$16.00')
  })

  it('formats another locale and currency', () => {
    const formatted = formatPrice(1234.5, 'de-DE', 'EUR')
    expect(formatted).toMatch(/1/)
    expect(formatted).toMatch(/234/)
    expect(formatted).toMatch(/50/)
  })
})

describe('getNameInitials', () => {
  it('returns 2 initials from first and last name', () => {
    expect(getNameInitials('Ada', 'Lovelace')).toBe('AL')
  })

  it('returns single initial if only one name exists', () => {
    expect(getNameInitials('Ada', null)).toBe('A')
    expect(getNameInitials(undefined, 'Lovelace')).toBe('L')
  })

  it('returns empty string if both names are missing', () => {
    expect(getNameInitials(null, undefined)).toBe('')
    expect(getNameInitials('', '   ')).toBe('')
  })

  it('trims spaces and uppercases initials', () => {
    expect(getNameInitials('  ada', 'lovelace  ')).toBe('AL')
  })
})

describe('formatUserListEmailForDisplay', () => {
  it('drops delete_<id>_ and joins from index 2 when length >= 3', () => {
    expect(
      formatUserListEmailForDisplay(
        'deleted_63bbafb8-afc2-4122-a275-c657bcf05dae_vakevag531@justnapa.com',
      ),
    ).toBe('vakevag531@justnapa.com')
    expect(
      formatUserListEmailForDisplay(
        'deleted_63bbafb8-afc2-4122-a275-c657bcf05dae_a_b@justnapa.com',
      ),
    ).toBe('a_b@justnapa.com')
  })

  it('uses index 1 when only delete_*@* (two segments)', () => {
    expect(formatUserListEmailForDisplay('deleted_user@example.com')).toBe(
      'user@example.com',
    )
  })

  it('returns plain email unchanged when there is no delete prefix', () => {
    expect(formatUserListEmailForDisplay('user@example.com')).toBe(
      'user@example.com',
    )
    expect(formatUserListEmailForDisplay('hello_world@example.com')).toBe(
      'hello_world@example.com',
    )
  })

  it('returns empty for null or blank', () => {
    expect(formatUserListEmailForDisplay(null)).toBe('')
    expect(formatUserListEmailForDisplay('   ')).toBe('')
  })
})
