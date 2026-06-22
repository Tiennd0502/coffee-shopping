import { render, screen, waitFor } from '@testing-library/react'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

describe('Avatar', () => {
  it('renders root with data-slot avatar', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(document.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('applies size data attribute for sm and lg', () => {
    const { rerender } = render(
      <Avatar size="sm">
        <AvatarFallback>X</AvatarFallback>
      </Avatar>,
    )
    expect(document.querySelector('[data-slot="avatar"]')).toHaveAttribute(
      'data-size',
      'sm',
    )
    rerender(
      <Avatar size="lg">
        <AvatarFallback>X</AvatarFallback>
      </Avatar>,
    )
    expect(document.querySelector('[data-slot="avatar"]')).toHaveAttribute(
      'data-size',
      'lg',
    )
  })

  it('merges className on Avatar', () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarFallback>Z</AvatarFallback>
      </Avatar>,
    )
    expect(document.querySelector('[data-slot="avatar"]')).toHaveClass(
      'custom-avatar',
    )
  })

  it('merges className on AvatarFallback', () => {
    render(
      <Avatar>
        <AvatarFallback className="uppercase tracking-wide">fb</AvatarFallback>
      </Avatar>,
    )
    const fb = screen.getByText('fb')
    expect(fb).toHaveClass('uppercase')
    expect(fb).toHaveClass('tracking-wide')
  })

  it('shows fallback when image fails to load', async () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.invalid/broken.png" alt="" />
        <AvatarFallback>XX</AvatarFallback>
      </Avatar>,
    )
    await waitFor(() => {
      expect(screen.getByText('XX')).toBeVisible()
    })
  })

  it('renders AvatarBadge with merged className', () => {
    render(
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
        <AvatarBadge className="bg-green-600" data-testid="badge" />
      </Avatar>,
    )
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-slot', 'avatar-badge')
    expect(badge).toHaveClass('bg-green-600')
  })
})
