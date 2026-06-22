'use client'

import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'

// Components
import { SearchInput } from '@/components/SearchInput'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserDropdown } from '@/components/UserDropdown'

// Utils
import { cn } from '@/utils/styles'
import { ROUTES } from '@/constants/routes'
import { SidebarTrigger } from '@/components/ui/sidebar'

export interface HeaderDashboardProps {
  className?: string
}

const HeaderDashboard = ({ className }: HeaderDashboardProps) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 my-auto flex min-w-0 w-full max-h-fit flex-1 items-center justify-center gap-3 rounded-none border-b bg-background px-5 py-6 shadow-xl shadow-on-surface/5',
        className,
      )}
    >
      <div className="flex min-w-0 w-full items-center justify-between gap-3 sm:gap-2 md:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <SidebarTrigger className="inline-block size-6 shrink-0" />
          <SearchInput
            aria-label="Search products"
            containerClassName="h-9 min-w-0 w-full max-w-md"
          />
        </div>
        <div className="flex shrink-0 items-end justify-end gap-4 sm:gap-10">
          <ThemeToggle className="h-8 w-8" />
          <SignedIn>
            <div className="shrink-0">
              <UserDropdown forceDropdown showChevron={false} isDashboard />
            </div>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn redirectUrl={ROUTES.SIGN_IN} />
          </SignedOut>
        </div>
      </div>
    </header>
  )
}

export default HeaderDashboard
