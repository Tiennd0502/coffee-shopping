import React from 'react'
import { render, screen } from '@testing-library/react'

import SocialButtons from '@/sections/SocialButtons'

const providerLoadingState = {
  facebook: false,
  google: false,
}

jest.mock('@/components/icon/FacebookIcon', () => ({
  __esModule: true,
  default: () => <span data-testid="facebook-icon" />,
}))

jest.mock('@/components/icon/GoogleIcon', () => ({
  __esModule: true,
  default: () => <span data-testid="google-icon" />,
}))

jest.mock('@clerk/elements/common', () => ({
  Connection: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Loading: ({
    scope,
    children,
  }: {
    scope: string
    children: (isLoading: boolean) => React.ReactNode
  }) => {
    const provider = scope.split(':')[1] as keyof typeof providerLoadingState
    return <>{children(providerLoadingState[provider])}</>
  },
}))

describe('SocialButtons', () => {
  beforeEach(() => {
    providerLoadingState.facebook = false
    providerLoadingState.google = false
  })

  it('renders both provider actions in idle state', () => {
    render(<SocialButtons />)

    expect(
      screen.getByRole('button', { name: /facebook/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.queryByTestId('spinner-icon')).not.toBeInTheDocument()
  })

  it('disables both provider actions when shared disabled state is active', () => {
    render(<SocialButtons disabled />)

    expect(screen.getByRole('button', { name: /facebook/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /google/i })).toBeDisabled()
  })

  it('shows a spinner only for the loading provider', () => {
    providerLoadingState.facebook = true

    render(<SocialButtons />)

    expect(screen.getAllByTestId('spinner-icon')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /facebook/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /google/i })).not.toBeDisabled()
  })
})
