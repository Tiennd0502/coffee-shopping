import * as Clerk from '@clerk/elements/common'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import FacebookIcon from '@/components/icon/FacebookIcon'
import GoogleIcon from '@/components/icon/GoogleIcon'

interface SocialButtonsProps {
  disabled?: boolean
}

const SocialButtons = ({ disabled = false }: SocialButtonsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Clerk.Loading scope="provider:google">
        {(isLoading) => (
          <Clerk.Connection asChild name="google">
            <Button
              type="button"
              disabled={disabled || isLoading}
              className="h-14 rounded-full border border-transparent bg-surface-container-high px-4 text-sm font-semibold text-on-surface shadow-none hover:bg-surface-container-highest"
            >
              <GoogleIcon width={16} height={16} />
              Google
              {isLoading && <Spinner decorative size="lg" />}
            </Button>
          </Clerk.Connection>
        )}
      </Clerk.Loading>
      <Clerk.Loading scope="provider:facebook">
        {(isLoading) => (
          <Clerk.Connection asChild name="facebook">
            <Button
              type="button"
              disabled={disabled || isLoading}
              className="h-14 rounded-full border border-transparent bg-surface-container-high px-4 text-sm font-semibold text-on-surface shadow-none hover:bg-surface-container-highest"
            >
              <FacebookIcon width={13} height={16} />
              Facebook
              {isLoading && <Spinner decorative size="lg" />}
            </Button>
          </Clerk.Connection>
        )}
      </Clerk.Loading>
    </div>
  )
}

export default SocialButtons
