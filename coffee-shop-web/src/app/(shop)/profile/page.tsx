import type { Metadata } from 'next'

import { ProfilePageView } from './ProfilePageView'

export const metadata: Metadata = {
  title: 'Profile | CoffeeHub',
  description: 'Your member status, account details, and order history.',
}

export default function ProfilePage() {
  return <ProfilePageView />
}
