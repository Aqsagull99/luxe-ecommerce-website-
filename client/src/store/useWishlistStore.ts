import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WishlistStore = {
  productIds: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) =>
        set((state) =>
          state.productIds.includes(productId)
            ? { productIds: state.productIds.filter((id) => id !== productId) }
            : { productIds: [...state.productIds, productId] }
        ),

      has: (productId) => get().productIds.includes(productId),

      clear: () => set({ productIds: [] }),
    }),
    { name: 'maison-wishlist' }
  )
)
