import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CuratedSelect = (props: { disabled?: boolean }) => (
  <Select>
    <SelectTrigger aria-label="Curated filter" disabled={props.disabled}>
      <SelectValue placeholder="Curated Selection" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="light">Light roast</SelectItem>
      <SelectItem value="medium">Medium roast</SelectItem>
    </SelectContent>
  </Select>
)

describe('Select', () => {
  it('renders trigger with data-slot select-trigger', () => {
    render(<CuratedSelect />)
    expect(
      document.querySelector('[data-slot="select-trigger"]'),
    ).toBeInTheDocument()
  })

  it('applies design-aligned trigger classes', () => {
    render(<CuratedSelect />)
    const trigger = screen.getByRole('combobox', { name: 'Curated filter' })
    expect(trigger).toHaveClass('w-full')
    expect(trigger).toHaveClass('justify-between')
    expect(trigger).toHaveClass('bg-surface-container-high')
    expect(trigger).toHaveClass('rounded-xs')
    expect(trigger).toHaveClass('border-0')
    expect(trigger).toHaveClass('text-on-surface')
  })

  it('shows placeholder text when no value is selected', () => {
    render(<CuratedSelect />)
    expect(screen.getByText('Curated Selection')).toBeInTheDocument()
  })

  it('opens list and selects an item on click', async () => {
    const user = userEvent.setup()
    render(<CuratedSelect />)
    const trigger = screen.getByRole('combobox', { name: 'Curated filter' })
    await user.click(trigger)

    const list = await screen.findByRole('listbox')
    const option = within(list).getByRole('option', { name: 'Medium roast' })
    await user.click(option)

    expect(screen.queryByText('Curated Selection')).not.toBeInTheDocument()
    expect(screen.getByText('Medium roast')).toBeInTheDocument()
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    render(<CuratedSelect disabled />)
    const trigger = screen.getByRole('combobox', { name: 'Curated filter' })
    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
