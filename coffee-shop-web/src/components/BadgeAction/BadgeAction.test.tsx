import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BadgeAction } from '@/components/BadgeAction'

describe('BadgeAction', () => {
  it('renders the label inside a button', () => {
    render(<BadgeAction label="Arabica" />)

    expect(
      screen.getByRole('button', {
        name: /arabica/i,
      }),
    ).toBeInTheDocument()
  })

  it('defaults the button type to button', () => {
    render(<BadgeAction label="Robusta" />)

    expect(screen.getByRole('button', { name: /robusta/i })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('calls onClick when activated', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<BadgeAction label="Espresso" onClick={handleClick} />)

    await user.click(screen.getByRole('button', { name: /espresso/i }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('forwards disabled state to the button', () => {
    render(<BadgeAction label="Latte" disabled />)

    expect(screen.getByRole('button', { name: /latte/i })).toBeDisabled()
  })
})
