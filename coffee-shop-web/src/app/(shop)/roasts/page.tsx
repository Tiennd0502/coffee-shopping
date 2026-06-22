import type { Metadata } from 'next'
import { Suspense } from 'react'

import Loading from '@/components/Loading'
import RoastsPageContent from '@/sections/RoastsPageContent'

export const metadata: Metadata = {
  title: 'CoffeeHub | Roast Collections',
  description:
    'Explore curated roast profiles with flexible filters for price, roast level, and collection style.',
}

export default function RoastsPage() {
  return (
    <Suspense fallback={<Loading size="lg" label="Loading roasts" />}>
      <RoastsPageContent />
    </Suspense>
  )
}
