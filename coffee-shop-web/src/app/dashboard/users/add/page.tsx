import Link from 'next/link'

import Breadcrumb from '@/components/Breadcrumb'
import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/styles'

export default function DashboardAddUserPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Users', href: ROUTES.DASHBOARD_USERS },
            { label: 'Add User', href: ROUTES.DASHBOARD_USERS_ADD },
          ]}
        />
        <Link
          href={ROUTES.DASHBOARD_USERS}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'w-auto',
          )}
        >
          Back to users
        </Link>
      </div>
      <p className="text-muted-foreground">
        Add user — placeholder. Connect create-user form or Clerk invite here.
      </p>
    </div>
  )
}
