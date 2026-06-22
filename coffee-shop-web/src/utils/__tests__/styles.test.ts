import { cn } from '../styles'

describe('cn', () => {
  it('joins static class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignores falsy clsx inputs', () => {
    expect(cn('base', false, null, undefined, 0, 'end')).toBe('base end')
  })

  it('merges conditional class names from clsx', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b')
  })

  it('dedupes conflicting Tailwind utilities via twMerge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('handles arrays and nested clsx-friendly values', () => {
    expect(cn(['mt-2', 'mt-4'], 'block')).toBe('mt-4 block')
  })
})
