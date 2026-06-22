'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface ClerkRedirectParams {
  signInRedirect?: string
  signUpRedirect?: string
  afterSignInUrl?: string
  afterSignUpUrl?: string
  redirectUrl?: string
}

export const useCleanClerkUrl = () => {
  const router = useRouter()
  const pathname = usePathname()

  const [params, setParams] = useState<ClerkRedirectParams>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const { hash } = window.location

    const parsed = new URLSearchParams(hash.replace(/^#\/?\??/, ''))

    const signInRedirect = parsed.get('sign_in_force_redirect_url') ?? undefined
    const signUpRedirect = parsed.get('sign_up_force_redirect_url') ?? undefined
    const afterSignInUrl = parsed.get('after_sign_in_url') ?? undefined
    const afterSignUpUrl = parsed.get('after_sign_up_url') ?? undefined
    const redirectUrl = parsed.get('redirect_url') ?? undefined

    const needsCleaning = [
      signInRedirect,
      signUpRedirect,
      afterSignInUrl,
      afterSignUpUrl,
      redirectUrl,
    ].some((value) => value !== undefined)

    if (needsCleaning) {
      router.replace(pathname)
    }

    setParams({
      signInRedirect,
      signUpRedirect,
      afterSignInUrl,
      afterSignUpUrl,
      redirectUrl,
    })
  }, [pathname, router])

  return params
}
