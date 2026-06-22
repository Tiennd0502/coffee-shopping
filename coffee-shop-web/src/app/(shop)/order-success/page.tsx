import type { Metadata } from 'next'

import OrderSuccessPageContent from '@/sections/OrderSuccessPageContent'

export const metadata: Metadata = {
  title: 'CoffeeHub | Order Successful',
  description: 'Your order has been placed successfully.',
}

export default function OrderSuccessPage() {
  return <OrderSuccessPageContent />
}
