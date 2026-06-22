import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox', () => {
  it('renders root with data-slot checkbox', () => {
    render(<Checkbox aria-label="Accept" />)
    expect(document.querySelector('[data-slot="checkbox"]')).toBeInTheDocument()
  })

  it('exposes checkbox role for accessibility', () => {
    render(<Checkbox aria-label="Terms" />)
    expect(screen.getByRole('checkbox', { name: 'Terms' })).toBeInTheDocument()
  })

  it('toggles checked state on click', async () => {
    const user = userEvent.setup()
    render(<Checkbox defaultChecked={false} aria-label="Notify" />)
    const box = screen.getByRole('checkbox', { name: 'Notify' })
    expect(box).toHaveAttribute('aria-checked', 'false')
    await user.click(box)
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    render(<Checkbox defaultChecked={false} disabled aria-label="Locked" />)
    const box = screen.getByRole('checkbox', { name: 'Locked' })
    expect(box).toHaveAttribute('aria-checked', 'false')
    await user.click(box)
    expect(box).toHaveAttribute('aria-checked', 'false')
  })

  it('renders label and associates it with the control', () => {
    render(<Checkbox label="Light Roast" defaultChecked={false} />)
    expect(
      screen.getByRole('checkbox', { name: 'Light Roast' }),
    ).toBeInTheDocument()
  })

  it('toggles when clicking the label', async () => {
    const user = userEvent.setup()
    render(<Checkbox label="Light Roast" defaultChecked={false} />)
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('aria-checked', 'false')
    await user.click(screen.getByText('Light Roast'))
    expect(box).toHaveAttribute('aria-checked', 'true')
  })

  it('does not toggle via label when disabled', async () => {
    const user = userEvent.setup()
    render(<Checkbox label="Light Roast" defaultChecked={false} disabled />)
    const box = screen.getByRole('checkbox')
    await user.click(screen.getByText('Light Roast'))
    expect(box).toHaveAttribute('aria-checked', 'false')
  })

  it('wraps labeled control with data-slot checkbox-field', () => {
    render(<Checkbox label="Option" />)
    expect(
      document.querySelector('[data-slot="checkbox-field"]'),
    ).toBeInTheDocument()
  })
})
