import { render, screen } from '@testing-library/react'

import { ThemeProvider } from '../ThemeProvider'

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <p>theme-child</p>
      </ThemeProvider>,
    )
    expect(screen.getByText('theme-child')).toBeInTheDocument()
  })
})
