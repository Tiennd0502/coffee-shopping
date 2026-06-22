import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeToggle } from '@/components/ThemeToggle'

const mockSetTheme = jest.fn()
let mockResolvedTheme: string | undefined = 'light'

jest.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
    mockResolvedTheme = 'light'
  })

  it('calls setTheme with dark when resolved theme is light', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    await user.click(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    )
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme with light when resolved theme is dark', async () => {
    mockResolvedTheme = 'dark'
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
    await user.click(
      screen.getByRole('button', { name: /switch to light mode/i }),
    )
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
