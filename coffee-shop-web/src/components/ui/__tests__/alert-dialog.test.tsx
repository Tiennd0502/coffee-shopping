import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function ControlledLogoutDialog(props: {
  onConfirm?: () => void
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          props.onOpenChange?.(next)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => props.onConfirm?.()}
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

describe('AlertDialog', () => {
  it('opens and shows title and description', async () => {
    const user = userEvent.setup()
    render(<ControlledLogoutDialog />)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))

    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Confirm Logout' }),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Are you sure you want to log out?'),
    ).toBeInTheDocument()
  })

  it('closes when Cancel is activated', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<ControlledLogoutDialog onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('fires confirm handler when Logout is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<ControlledLogoutDialog onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Logout' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('marks destructive action with destructive variant classes', async () => {
    const user = userEvent.setup()
    render(<ControlledLogoutDialog />)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    const dialog = await screen.findByRole('alertdialog')
    const logout = within(dialog).getByRole('button', { name: 'Logout' })
    expect(logout).toHaveClass('bg-destructive')
  })
})
