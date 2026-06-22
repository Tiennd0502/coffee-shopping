import { Suspense } from 'react'

import OrdersPageContent from '@/sections/OrdersPageContent'
import Loading from '@/components/Loading'

export default function DashboardOrdersPage() {
  return (
    <Suspense fallback={<Loading size="lg" label="Loading orders page" />}>
      <OrdersPageContent />
    </Suspense>
  )
}
