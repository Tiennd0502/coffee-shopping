import type { Metadata } from 'next'

import CartPageContent from '@/sections/CartPageContent'

export const metadata: Metadata = {
  title: 'CoffeeHub | Your Sensory Cart',
  description: 'Review your selected products before checkout.',
}

export default function CartPage() {
  return <CartPageContent />
}
