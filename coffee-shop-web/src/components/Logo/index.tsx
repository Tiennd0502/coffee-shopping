import React from 'react'
import Link from 'next/link'

import { ROUTES } from '@/constants/routes'

const Logo = () => {
  return (
    <div className="flex ml-0 mr-auto min-w-0 flex-1 max-w-25 items-center">
      <Link
        href={ROUTES.HOME}
        className="shrink-0 text-lg font-bold tracking-tight text-foreground"
      >
        CoffeeHub
      </Link>
    </div>
  )
}

export default Logo
