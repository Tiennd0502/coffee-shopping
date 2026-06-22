import { render, screen } from '@testing-library/react'

import { Text } from '@/components/Text'

describe('Text', () => {
  it('renders a paragraph by default', () => {
    render(<Text>Default body</Text>)

    const text = screen.getByText('Default body')
    expect(text.tagName).toBe('P')
    expect(text).toHaveAttribute('data-slot', 'text')
  })

  it('renders the requested semantic tag', () => {
    render(<Text as="h3">Section title</Text>)

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Section title',
      }),
    ).toBeInTheDocument()
  })

  it('applies base and tag-specific classes', () => {
    render(<Text as="h6">Eyebrow</Text>)

    expect(screen.getByText('Eyebrow')).toHaveClass(
      'text-on-surface',
      'text-sm',
      'font-semibold',
    )
  })

  it('merges custom classes and forwards html props', () => {
    render(
      <Text as="span" className="tracking-wide" id="custom-text">
        Inline copy
      </Text>,
    )

    expect(screen.getByText('Inline copy')).toHaveAttribute('id', 'custom-text')
    expect(screen.getByText('Inline copy')).toHaveClass('tracking-wide')
  })
})
