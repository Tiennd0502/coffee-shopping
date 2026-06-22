import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Textarea } from '@/components/ui/textarea'

describe('Textarea', () => {
  it('forwards ref', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} defaultValue="" />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('preserves multiline content', async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="desc" defaultValue="" />)
    const el = screen.getByLabelText('desc')
    await user.type(el, 'Line one{enter}Line two')
    expect(el).toHaveValue('Line one\nLine two')
  })

  it('merges custom className with base styles', () => {
    render(<Textarea aria-label="t" className="min-h-48" />)
    const el = screen.getByLabelText('t')
    expect(el).toHaveClass('min-h-48')
    expect(el).toHaveClass('bg-surface-container-high')
    expect(el).toHaveClass('rounded-none')
  })

  it('includes relaxed line height utility', () => {
    render(<Textarea aria-label="x" />)
    expect(screen.getByLabelText('x')).toHaveClass('leading-relaxed')
  })
})
