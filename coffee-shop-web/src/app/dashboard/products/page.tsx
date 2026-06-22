import { Suspense } from 'react'

import { PageContent } from './PageContent'
import { Spinner } from '@/components/ui/spinner'

export default function DashboardProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-12 text-center text-muted-foreground">
          <Spinner
            size="lg"
            label="Loading products page"
            className="text-primary"
          />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  )
}
