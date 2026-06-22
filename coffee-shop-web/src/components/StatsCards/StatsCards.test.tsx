import { Mail, UserPlus } from 'lucide-react'
import { render, screen } from '@testing-library/react'

import { StatsCards } from '@/components/StatsCards'

describe('StatsCards', () => {
  it('renders nothing for empty items', () => {
    const { container } = render(<StatsCards items={[]} />)

    expect(container.querySelector('[data-slot="stats-cards"]')).toBeNull()
  })

  it('renders all cards with label and values', () => {
    render(
      <StatsCards
        items={[
          { id: 'users', label: 'Total users', value: '1,284' },
          { id: 'baristas', label: 'Active baristas', value: 42 },
        ]}
      />,
    )

    expect(screen.getByText('Total users')).toBeInTheDocument()
    expect(screen.getByText('1,284')).toBeInTheDocument()
    expect(screen.getByText('Active baristas')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="stats-card"]')).toHaveLength(
      2,
    )
  })

  it('applies accent styles and renders watermark icon', () => {
    render(
      <StatsCards
        items={[
          {
            id: 'pending',
            label: 'Pending invites',
            value: '07',
            variant: 'accent',
            icon: UserPlus,
          },
        ]}
      />,
    )

    const card = screen
      .getByText('Pending invites')
      .closest('[data-slot="stats-card"]')
    expect(card).toHaveClass('bg-primary')
    expect(card).toHaveClass('text-primary-foreground')
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders footnote icon and success tone class', () => {
    render(
      <StatsCards
        items={[
          {
            id: 'users',
            label: 'Total users',
            value: '1,284',
            footnote: '+12% this month',
            footnoteTone: 'success',
            footnoteIcon: Mail,
          },
        ]}
      />,
    )

    const footnote = screen.getByText('+12% this month').closest('p')
    expect(footnote).toHaveClass('text-emerald-700')
    expect(footnote?.querySelector('svg')).toBeInTheDocument()
  })
})
