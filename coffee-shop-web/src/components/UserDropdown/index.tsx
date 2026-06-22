'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

// Types
import { DIRECTION } from '@/types/svg'

// Constants
import { LOCAL_STORAGE_KEYS } from '@/constants/common'
import { USER_DROPDOWNS, USER_DROPDOWNS_LENGTH } from '@/constants/nav'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/messages'

// Utils
import { cn } from '@/utils/styles'

// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar } from '@/components/Avatar'
import { ChevronIcon } from '../icon/ChevronIcon'
import AlertDialog from '../AlertDialog'
import { Button } from '../ui/button'
import { ROUTES } from '@/constants/routes'
import { User } from 'lucide-react'

interface UserDropdownProps {
  isAdmin?: boolean
  onChange?: () => void
  forceDropdown?: boolean
  showChevron?: boolean
  isDashboard?: boolean
}

export const UserDropdown = ({
  isAdmin = false,
  onChange,
  forceDropdown = false,
  showChevron = true,
  isDashboard = false,
}: UserDropdownProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const isUserProfile = pathname.startsWith(ROUTES.USER_PROFILE)
  const { user } = useUser()
  const { signOut } = useClerk()

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    imageUrl = '',
    firstName = '',
    lastName = '',
    fullName = '',
    emailAddresses = [],
  } = user ?? {}
  const email = emailAddresses[0]?.emailAddress ?? ''
  const displayName = isDashboard
    ? fullName
    : `${firstName?.trim().charAt(0) ?? ''}${lastName?.trim().charAt(0) ?? ''}`

  const handleToggleModal = (nextOpen?: boolean) => {
    setIsOpen(Boolean(nextOpen))
  }

  const handleClick = (href: string, isSignOut: boolean) => {
    if (isSignOut) {
      return handleToggleModal(true)
    }
    onChange?.()
    return router.push(href)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    localStorage.setItem(LOCAL_STORAGE_KEYS.MANUAL_SIGN_OUT, 'true')
    await signOut({ redirectUrl: pathname })
      .then(() => {
        toast.success(SUCCESS_MESSAGES.SIGNED_OUT)
      })
      .catch(() => {
        toast.error(ERROR_MESSAGES.SIGN_OUT_FAILED)
      })
      .finally(() => {
        onChange?.()
        setIsLoading(false)
        setIsOpen(false)
      })
  }

  const accountDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <div
          data-testid="btn-dropdown"
          className="flex w-fit items-center gap-3.5"
        >
          <Avatar
            email={email}
            isDashboard={isDashboard}
            src={imageUrl || ''}
            name={displayName ?? ''}
            size="default"
            isActive
          />
          {showChevron ? <ChevronIcon direction={DIRECTION.DOWN} /> : null}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        sideOffset={0}
        className="mt-2 w-fit rounded-sm p-0 shadow-lg"
      >
        {USER_DROPDOWNS(isAdmin, isDashboard).map(
          ({ text, href, isSignOut = false, Icon = User }, index) => (
            <DropdownMenuItem
              data-testid="dropdown-menu-item"
              key={index}
              className={cn(
                'font-primary flex cursor-pointer flex-row items-center justify-star px-5 py-2.5 hover:rounded-none !hover:text-primary',
                index < USER_DROPDOWNS_LENGTH - 1 && 'rounded-none border-b',
              )}
              onClick={() => handleClick(href, isSignOut)}
            >
              <Icon />
              {text}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {forceDropdown ? (
        accountDropdown
      ) : (
        <>
          <div className="hidden md:block">{accountDropdown}</div>
          <div className="md:hidden">
            <div className="flex flex-col items-start gap-2">
              {USER_DROPDOWNS(isAdmin, isDashboard).map(
                ({ text = '', href = '', isSignOut = false }, index) => (
                  <Button
                    data-testid="menu-item"
                    variant="ghost"
                    key={index}
                    className={cn(
                      'h-fit w-full items-start justify-start px-5 py-2 font-bold text-current hover:text-primary hover:no-underline',
                      isUserProfile &&
                        href === ROUTES.USER_PROFILE &&
                        'bg-accent text-primary',
                    )}
                    onClick={() => handleClick(href, isSignOut)}
                  >
                    {text}
                  </Button>
                ),
              )}
            </div>
          </div>
        </>
      )}
      <AlertDialog
        data-testid="modal-confirm"
        open={isOpen}
        isLoading={isLoading}
        onOpenChange={handleToggleModal}
        title="Confirm Logout"
        description="Are you sure you want to log out?"
        textAction="Logout"
        onClickAction={handleSignOut}
      />
    </>
  )
}
