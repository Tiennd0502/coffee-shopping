import { Suspense } from 'react'

import Loading from '@/components/Loading'
import PageContent from './PageContent'

export default function AddCategoryPage() {
  return (
    <Suspense fallback={<Loading label="Loading add category page" />}>
      <PageContent />
    </Suspense>
  )
}
