import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Switch } from '@/components/ui/switch'

describe('Switch', () => {
  it('renders root with data-slot switch', () => {
    render(<Switch />)
    expect(document.querySelector('[data-slot="switch"]')).toBeInTheDocument()
  })

  it('renders thumb with data-slot switch-thumb', () => {
    render(<Switch />)
    expect(
      document.querySelector('[data-slot="switch-thumb"]'),
    ).toBeInTheDocument()
  })

  it('exposes switch role for accessibility', () => {
    render(<Switch aria-label="Notifications" />)
    expect(
      screen.getByRole('switch', { name: 'Notifications' }),
    ).toBeInTheDocument()
  })

  it('toggles checked state on click', async () => {
    const user = userEvent.setup()
    render(<Switch defaultChecked={false} />)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'false')
    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    render(<Switch defaultChecked={false} disabled />)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'false')
    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('applies sm size data attribute', () => {
    render(<Switch size="sm" aria-label="Small" />)
    expect(screen.getByRole('switch')).toHaveAttribute('data-size', 'sm')
  })
})
