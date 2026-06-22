import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('applies default variant classes', () => {
    render(<Button>Submit</Button>)
    const btn = screen.getByRole('button', { name: 'Submit' })
    expect(btn).toHaveClass('bg-gradient-to-r')
    expect(btn).toHaveClass('from-primary')
    expect(btn).toHaveClass('to-ring')
    expect(btn).toHaveClass('text-on-primary')
    expect(btn).toHaveClass('shadow-md')
    expect(btn).toHaveClass('shadow-primary/15')
  })

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Out</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-outline-variant')
    expect(screen.getByRole('button')).toHaveClass('bg-surface-container-low')
    expect(screen.getByRole('button')).toHaveClass('rounded-full')
  })

  it('applies icon size class (aligned with md)', () => {
    render(
      <Button size="icon" aria-label="icon-only">
        x
      </Button>,
    )
    expect(screen.getByRole('button')).toHaveClass('size-10')
  })

  it('uses default size height', () => {
    render(<Button>Label</Button>)
    expect(screen.getByRole('button', { name: 'Label' })).toHaveClass('h-14')
  })

  it.each([
    ['xs', 'h-10'],
    ['sm', 'h-12'],
    ['lg', 'h-16'],
    ['xl', 'h-18'],
  ] as const)('applies height for size %s', (size, heightClass) => {
    render(<Button size={size}>Label</Button>)
    expect(screen.getByRole('button', { name: 'Label' })).toHaveClass(
      heightClass,
    )
  })

  it('sets type button by default', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(
      <Button disabled onClick={handleClick}>
        X
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('sets loading state with aria-busy and disables interaction', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(
      <Button loading onClick={handleClick}>
        Save
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    await user.click(btn)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('includes focus-visible ring utilities', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('focus-visible:ring-ring/50')
  })
})
