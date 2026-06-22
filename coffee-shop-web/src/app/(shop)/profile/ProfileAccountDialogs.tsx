'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/styles'

type ModalAction = 'email' | 'password' | null

export function ProfileAccountDialogs() {
  const [modal, setModal] = useState<ModalAction>(null)

  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 md:justify-start">
        <Button
          disabled
          type="button"
          variant="secondary"
          className="w-auto px-6 bg-surface-container-highest text-base font-semibold text-primary hover:bg-surface-container-highest/80"
          onClick={() => setModal('email')}
        >
          Change Email
        </Button>
        <Button
          disabled
          type="button"
          variant="secondary"
          className="w-auto px-6 bg-surface-container-highest text-base font-semibold text-primary hover:bg-surface-container-highest/80"
          onClick={() => setModal('password')}
        >
          Change Password
        </Button>
      </div>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={() => setModal(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-dialog-title"
            className={cn(
              'relative z-10 w-full max-w-md rounded-xl bg-surface p-10 shadow-2xl',
            )}
          >
            {modal === 'email' ? (
              <>
                <h2
                  id="profile-dialog-title"
                  className="mb-6 font-headline text-2xl text-on-surface"
                >
                  Change Email Address
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="new-email"
                      className="mb-2 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                    >
                      New Email Address
                    </Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="Enter new email"
                      className="rounded-xl border-0 bg-surface-container-high p-4 focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="confirm-pw-email"
                      className="mb-2 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-pw-email"
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl border-0 bg-surface-container-high p-4 focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2
                  id="profile-dialog-title"
                  className="mb-6 font-headline text-2xl text-on-surface"
                >
                  Change Password
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="current-pw"
                      className="mb-2 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                    >
                      Current Password
                    </Label>
                    <Input
                      id="current-pw"
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl border-0 bg-surface-container-high p-4 focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="new-pw"
                      className="mb-2 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                    >
                      New Password
                    </Label>
                    <Input
                      id="new-pw"
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl border-0 bg-surface-container-high p-4 focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-4 pt-8">
              <Button
                type="button"
                className="flex-1 rounded-full py-6 font-bold"
                onClick={() => setModal(null)}
              >
                {modal === 'email' ? 'Update Email' : 'Update Password'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-full border-0 bg-surface-container-highest py-6 font-bold text-on-surface-variant hover:bg-surface-container-high"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
