import React from 'react'
import Link from 'next/link'

import { ROUTES } from '@/constants/routes'

const FooterDashboard = () => {
  return (
    <div className="py-10 px-10 flex gap-6">
      <div className="flex ml-0 mr-auto min-w-0 flex-1 max-w-25 items-center">
        <Link
          href={ROUTES.HOME}
          className="shrink-0 text-lg font-bold tracking-tight text-primary"
        >
          CoffeeHub
        </Link>
      </div>
      <p className="mt-4 text-center text-xs tracking-widest text-on-surface/50 uppercase dark:text-inverse-on-surface/50">
        © 2026 All Rights Reserved.
      </p>
    </div>
  )
}

export default FooterDashboard
