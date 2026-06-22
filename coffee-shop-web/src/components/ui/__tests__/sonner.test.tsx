import { render, screen, waitFor } from '@testing-library/react'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/theme/ThemeProvider'

describe('Toaster', () => {
  it('renders the notifications region inside ThemeProvider', async () => {
    render(
      <ThemeProvider>
        <Toaster />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /notifications/i }),
      ).toBeInTheDocument()
    })
  })
})
