import { Suspense } from 'react'

import Loading from '@/components/Loading'
import { PageContent } from './PageContent'

export default function UsersPage() {
  return (
    <Suspense fallback={<Loading label="Loading users page" />}>
      <PageContent />
    </Suspense>
  )
}
