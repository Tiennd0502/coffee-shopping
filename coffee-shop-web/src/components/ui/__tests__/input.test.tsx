import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('forwards ref to the native input', () => {
    const ref = createRef<HTMLElement>()
    render(<Input ref={ref} defaultValue="" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('calls onChange when user types (uncontrolled)', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input defaultValue="" onChange={handleChange} aria-label="qty" />)
    await user.type(screen.getByLabelText('qty'), '42')
    expect(handleChange).toHaveBeenCalled()
    expect(screen.getByLabelText('qty')).toHaveValue('42')
  })

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup()
    render(<Input defaultValue="a" disabled aria-label="x" />)
    const input = screen.getByLabelText('x')
    expect(input).toBeDisabled()
    await user.type(input, 'b')
    expect(input).toHaveValue('a')
  })

  it('applies mockup field classes', () => {
    render(<Input aria-label="f" />)
    const input = screen.getByLabelText('f')
    expect(input).toHaveClass('rounded-xs')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('border-outline-variant/70')
    expect(input).toHaveClass('bg-surface-container-high')
    expect(input).toHaveClass('text-md')
  })

  it('sets aria-invalid on the element', () => {
    render(<Input aria-label="e" aria-invalid />)
    expect(screen.getByLabelText('e')).toHaveAttribute('aria-invalid', 'true')
  })

  it('includes focus-visible ring utilities', () => {
    render(<Input aria-label="r" />)
    expect(screen.getByLabelText('r')).toHaveClass('focus-visible:ring-ring/50')
    expect(screen.getByLabelText('r')).toHaveClass('focus-visible:border-ring')
  })

  it('includes destructive border utilities for invalid state', () => {
    render(<Input aria-label="err" aria-invalid />)
    expect(screen.getByLabelText('err')).toHaveClass(
      'aria-invalid:border-destructive',
    )
  })
})
