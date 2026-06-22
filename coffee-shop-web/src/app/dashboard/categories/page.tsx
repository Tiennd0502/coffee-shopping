import { Suspense } from 'react'

import Loading from '@/components/Loading'
import { PageContent } from './PageContent'

export default function DashboardCategoriesPage() {
  return (
    <Suspense fallback={<Loading label="Loading categories page" />}>
      <PageContent />
    </Suspense>
  )
}
