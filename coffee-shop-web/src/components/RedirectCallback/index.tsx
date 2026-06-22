import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

// Components
import { Spinner } from '@/components/ui/spinner'

const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? ''

const RedirectCallback = () => {
  return (
    <>
      <AuthenticateWithRedirectCallback
        signInUrl={SIGN_IN_URL}
        signUpUrl={SIGN_IN_URL}
      />
      <div className="flex justify-center py-8">
        <Spinner size="lg" label="Redirecting" className="text-primary" />
      </div>
    </>
  )
}

export default RedirectCallback
