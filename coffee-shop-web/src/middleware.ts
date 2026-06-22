import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { ROLES } from '@/constants/user'
import { ROUTES } from '@/constants/routes'
import { getSessionPublicRole } from '@/utils/session'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isProfileRoute = createRouteMatcher([`${ROUTES.USER_PROFILE}(.*)`])
const isCheckoutRoute = createRouteMatcher([`${ROUTES.CHECKOUT}(.*)`])

export default clerkMiddleware(async (auth, request) => {
  if (isProfileRoute(request) || isCheckoutRoute(request)) {
    await auth.protect()
    return NextResponse.next()
  }

  if (!isDashboardRoute(request)) {
    return
  }

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    await auth.protect()
    return
  }

  const role = getSessionPublicRole(sessionClaims)
  if (role !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
    '/checkout',
    '/checkout/:path*',
  ],
}
