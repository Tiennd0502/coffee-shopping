'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { EMPTY_IMAGE } from '@/constants/images'
import type { CartAddItemInput, CartItem, CartTotals } from '@/types/cart'
import { buildCartTotals, clampQuantity } from '@/utils/cart'
import type { Order } from '@/types/order'

const CART_STORAGE_KEY = 'coffeehub-cart'

const sanitizeItems = (items: unknown): CartItem[] => {
  if (!Array.isArray(items)) return []

  return items
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => item as CartItem)
    .filter(
      (item) => typeof item.id === 'string' && typeof item.name === 'string',
    )
    .map((item) => ({
      ...item,
      variantId: item.variantId || item.id || item.productId,
      imageUrl: item.imageUrl || EMPTY_IMAGE,
      quantity: clampQuantity(item.quantity, item.maxQuantity),
    }))
}

interface CartStoreState {
  items: CartItem[]
  totals: CartTotals
  hasHydrated: boolean
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  itemSnapshots: Order | null
  addItem: (item: CartAddItemInput) => void
  changeQuantity: (itemId: string, amount: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  setItemSnapshots: (snapshot: Order) => void
  clearItemSnapshots: () => void
  refetch: () => void
}

const toStateWithItems = (items: CartItem[]) => ({
  items,
  totals: buildCartTotals(items),
})

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      ...toStateWithItems([]),
      hasHydrated: false,
      isLoading: true,
      isError: false,
      errorMessage: null,
      itemSnapshots: null,
      addItem: (nextItem) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.variantId === nextItem.variantId,
          )

          if (existing) {
            const nextItems = state.items.map((item) =>
              item.variantId === nextItem.variantId
                ? {
                    ...item,
                    quantity: clampQuantity(
                      item.quantity + nextItem.quantity,
                      item.maxQuantity,
                    ),
                  }
                : item,
            )

            return {
              ...toStateWithItems(nextItems),
            }
          }

          const nextItems = [
            ...state.items,
            {
              ...nextItem,
              id: nextItem.variantId || nextItem.productId,
              imageUrl: nextItem.imageUrl || EMPTY_IMAGE,
              quantity: clampQuantity(nextItem.quantity, nextItem.maxQuantity),
            },
          ]

          return {
            ...toStateWithItems(nextItems),
          }
        }),
      changeQuantity: (itemId, amount) =>
        set((state) => {
          const nextItems = state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: clampQuantity(amount, item.maxQuantity),
                }
              : item,
          )

          return {
            ...toStateWithItems(nextItems),
          }
        }),
      removeItem: (itemId) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.id !== itemId)
          return {
            ...toStateWithItems(nextItems),
          }
        }),
      clearCart: () =>
        set(() => ({
          ...toStateWithItems([]),
        })),
      setItemSnapshots: (snapshot) =>
        set(() => ({
          itemSnapshots: snapshot,
        })),
      clearItemSnapshots: () =>
        set(() => ({
          itemSnapshots: null,
        })),
      refetch: () =>
        set(() => ({
          errorMessage: null,
          isError: false,
        })),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        itemSnapshots: state.itemSnapshots,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) return

        if (error) {
          state.items = []
          state.itemSnapshots = null
          state.totals = buildCartTotals([])
          state.errorMessage =
            'We could not sync your cart. Please refresh and try again.'
          state.hasHydrated = true
          state.isLoading = false
          state.isError = true
        } else {
          const sanitizedItems = sanitizeItems(state?.items)
          state.items = sanitizedItems
          state.itemSnapshots = state.itemSnapshots
          state.totals = buildCartTotals(sanitizedItems)
          state.hasHydrated = true
          state.isLoading = false
          state.isError = false
          state.errorMessage = null
        }
      },
    },
  ),
)
