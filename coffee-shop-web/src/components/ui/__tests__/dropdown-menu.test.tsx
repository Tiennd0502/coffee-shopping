import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ActionsMenu = (props: { onAlpha?: () => void; onBeta?: () => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger>Open actions</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={props.onAlpha}>Alpha</DropdownMenuItem>
      <DropdownMenuItem onClick={props.onBeta} disabled>
        Beta
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

describe('DropdownMenu', () => {
  it('renders trigger with data-slot dropdown-menu-trigger', () => {
    render(<ActionsMenu />)
    expect(
      document.querySelector('[data-slot="dropdown-menu-trigger"]'),
    ).toBeInTheDocument()
  })

  it('opens menu and shows items on trigger click', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)
    await user.click(screen.getByRole('button', { name: 'Open actions' }))

    const menu = await screen.findByRole('menu')
    expect(
      within(menu).getByRole('menuitem', { name: 'Alpha' }),
    ).toBeInTheDocument()
    expect(
      within(menu).getByRole('menuitem', { name: 'Beta' }),
    ).toBeInTheDocument()
  })

  it('fires item onClick when an enabled item is activated', async () => {
    const user = userEvent.setup()
    const handleAlpha = jest.fn()
    render(<ActionsMenu onAlpha={handleAlpha} />)
    await user.click(screen.getByRole('button', { name: 'Open actions' }))
    const menu = await screen.findByRole('menu')
    await user.click(within(menu).getByRole('menuitem', { name: 'Alpha' }))
    expect(handleAlpha).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick for a disabled item', async () => {
    const user = userEvent.setup()
    const handleBeta = jest.fn()
    render(<ActionsMenu onBeta={handleBeta} />)
    await user.click(screen.getByRole('button', { name: 'Open actions' }))
    const menu = await screen.findByRole('menu')
    const beta = within(menu).getByRole('menuitem', { name: 'Beta' })
    expect(beta).toHaveAttribute('aria-disabled', 'true')
    await user.click(beta)
    expect(handleBeta).not.toHaveBeenCalled()
  })

  it('applies design-aligned surface classes on content', async () => {
    const user = userEvent.setup()
    render(<ActionsMenu />)
    await user.click(screen.getByRole('button', { name: 'Open actions' }))
    const content = await screen.findByRole('menu')
    expect(content).toHaveClass('bg-surface-container-high')
    expect(content).toHaveClass('border-outline-variant')
    expect(content).toHaveClass('text-on-surface')
    expect(content).toHaveClass('rounded-sm')
  })

  it('marks destructive items for styling', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>D</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'D' }))
    const item = await screen.findByRole('menuitem', { name: 'Remove' })
    expect(item).toHaveClass('data-[variant=destructive]:text-destructive')
  })
})
