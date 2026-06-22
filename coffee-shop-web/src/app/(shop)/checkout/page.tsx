import type { Metadata } from 'next'

import CheckoutPageContent from '@/sections/CheckoutPageContent'

export const metadata: Metadata = {
  title: 'CoffeeHub | Checkout',
  description: 'Finalize your brew order and place your checkout.',
}

export default function CheckoutPage() {
  return <CheckoutPageContent />
}
