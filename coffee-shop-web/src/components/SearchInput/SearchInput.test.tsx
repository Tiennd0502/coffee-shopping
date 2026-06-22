import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SearchInput } from '@/components/SearchInput'

describe('SearchInput', () => {
  it('uses default placeholder', () => {
    render(<SearchInput aria-label="Search" />)
    expect(screen.getByLabelText('Search')).toHaveAttribute(
      'placeholder',
      'Search...',
    )
  })

  it('allows placeholder override', () => {
    render(<SearchInput aria-label="Search" placeholder="Find coffee…" />)
    expect(screen.getByLabelText('Search')).toHaveAttribute(
      'placeholder',
      'Find coffee…',
    )
  })

  it('merges className onto the input', () => {
    render(<SearchInput aria-label="q" className="font-mono" />)
    expect(screen.getByLabelText('q')).toHaveClass('font-mono')
  })

  it('merges containerClassName onto the wrapper', () => {
    render(<SearchInput aria-label="q" containerClassName="max-w-xs" />)
    expect(
      screen.getByLabelText('q').closest('[data-slot="search-input"]'),
    ).toHaveClass('max-w-xs')
  })

  it('forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<SearchInput ref={ref} aria-label="x" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('lets the user type when uncontrolled', async () => {
    const user = userEvent.setup()
    render(<SearchInput aria-label="field" defaultValue="" />)
    await user.type(screen.getByLabelText('field'), 'latte')
    expect(screen.getByLabelText('field')).toHaveValue('latte')
  })

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup()
    render(<SearchInput aria-label="x" defaultValue="a" disabled />)
    const input = screen.getByLabelText('x')
    expect(input).toBeDisabled()
    await user.type(input, 'b')
    expect(input).toHaveValue('a')
  })

  it('exposes data-slot on wrapper and control', () => {
    render(<SearchInput aria-label="s" />)
    const input = screen.getByLabelText('s')
    expect(input).toHaveAttribute('data-slot', 'search-input-control')
    expect(input.closest('[data-slot="search-input"]')).toBeInTheDocument()
  })

  it('applies pill and token classes on wrapper', () => {
    render(<SearchInput aria-label="p" />)
    const wrap = screen
      .getByLabelText('p')
      .closest('[data-slot="search-input"]')
    expect(wrap).toHaveClass('rounded-full')
    expect(wrap).toHaveClass('bg-input')
    expect(wrap).toHaveClass('focus-within:ring-ring/50')
  })

  it('sets type search by default', () => {
    render(<SearchInput aria-label="t" />)
    expect(screen.getByLabelText('t')).toHaveAttribute('type', 'search')
  })

  it('allows type text', () => {
    render(<SearchInput aria-label="t" type="text" />)
    expect(screen.getByLabelText('t')).toHaveAttribute('type', 'text')
  })
})
