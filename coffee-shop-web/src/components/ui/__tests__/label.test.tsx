import { render, screen } from '@testing-library/react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

describe('Label', () => {
  it('associates with control via htmlFor and id', () => {
    render(
      <>
        <Label htmlFor="product-name">Product name</Label>
        <Input id="product-name" defaultValue="" />
      </>,
    )
    expect(screen.getByLabelText('Product name')).toBeInTheDocument()
  })

  it('applies field label styles', () => {
    render(<Label htmlFor="x">Name</Label>)
    const label = screen.getByText('Name')
    expect(label).toHaveClass('text-sm')
    expect(label).toHaveClass('tracking-widest')
    expect(label).toHaveClass('text-on-surface-variant')
  })
})
