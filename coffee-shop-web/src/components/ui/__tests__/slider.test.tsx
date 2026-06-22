import { render } from '@testing-library/react'

import { Slider } from '@/components/ui/slider'

describe('Slider', () => {
  it('renders root with data-slot slider', () => {
    render(<Slider value={[20, 80]} min={0} max={100} />)
    expect(document.querySelector('[data-slot="slider"]')).toBeInTheDocument()
  })

  it('renders track and range slots', () => {
    render(<Slider value={[20, 80]} max={100} />)
    expect(
      document.querySelector('[data-slot="slider-track"]'),
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="slider-range"]'),
    ).toBeInTheDocument()
  })

  it('renders two thumbs for range value', () => {
    render(<Slider value={[20, 80]} max={100} />)
    expect(
      document.querySelectorAll('[data-slot="slider-thumb"]'),
    ).toHaveLength(2)
  })

  it('derives single thumb from numeric value', () => {
    render(<Slider value={50} max={100} />)
    expect(
      document.querySelectorAll('[data-slot="slider-thumb"]'),
    ).toHaveLength(1)
  })
})
