import type { ClerkUser, User } from '@/types/user'

function joinNameParts(
  first: string | null | undefined,
  last: string | null | undefined,
): string | null {
  const s = [first, last]
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .join(' ')
    .trim()
  return s.length > 0 ? s : null
}

export function resolveProfilePresentation(
  user: User | null,
  clerkUser: ClerkUser | null | undefined,
  fallbackImage: string,
) {
  const apiNameTrimmed = user?.name?.trim()
  const fromApiName =
    apiNameTrimmed && apiNameTrimmed.length > 0
      ? apiNameTrimmed
      : joinNameParts(user?.firstName, user?.lastName)

  const clerkFullTrimmed = clerkUser?.fullName?.trim()
  const fromClerkName =
    clerkFullTrimmed && clerkFullTrimmed.length > 0
      ? clerkFullTrimmed
      : joinNameParts(clerkUser?.firstName, clerkUser?.lastName)

  const displayName =
    fromApiName ??
    fromClerkName ??
    user?.email ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    'Member'

  const email =
    user?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? ''

  const imageSrc = user?.avatarUrl ?? clerkUser?.imageUrl ?? fallbackImage

  return { displayName, email, imageSrc }
}
