import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, ProductVariant } from '@/lib/supabase'

export type CartProduct = {
  id: string
  productId: string
  variantId: string | null
  name: string
  variantName: string
  price: number
  quantity: number
  imageUrl: string
  slug: string
  stockQty: number
}

type CartStore = {
  items: CartProduct[]
  couponCode: string
  couponDiscount: number
  couponType: 'percentage' | 'fixed' | 'free_shipping' | null
  addItem: (product: Product, variant?: ProductVariant | null, qty?: number) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number, type: 'percentage' | 'fixed' | 'free_shipping') => void
  removeCoupon: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getShipping: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: '',
      couponDiscount: 0,
      couponType: null,

      addItem: (product, variant = null, qty = 1) => {
        const price = variant
          ? product.price + (variant.price_modifier || 0)
          : (product.sale_price ?? product.price)
        const imageUrl =
          variant?.image_url ||
          (product.images?.[0]?.url ?? '')
        const variantId = variant?.id ?? null
        const variantName = variant
          ? [variant.color, variant.size, variant.material].filter(Boolean).join(' / ')
          : ''
        const itemId = `${product.id}-${variantId ?? 'base'}`

        set((state) => {
          const existing = state.items.find((i) => i.id === itemId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === itemId ? { ...i, quantity: i.quantity + qty } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: itemId,
                productId: product.id,
                variantId,
                name: product.name,
                variantName,
                price,
                quantity: qty,
                imageUrl,
                slug: product.slug,
                stockQty: variant?.stock_quantity ?? product.stock_quantity,
              },
            ],
          }
        })
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) => {
        if (qty < 1) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        }))
      },

      clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0, couponType: null }),

      applyCoupon: (code, discount, type) =>
        set({ couponCode: code, couponDiscount: discount, couponType: type }),

      removeCoupon: () =>
        set({ couponCode: '', couponDiscount: 0, couponType: null }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getDiscount: () => {
        const { couponType, couponDiscount } = get()
        const subtotal = get().getSubtotal()
        if (!couponType || couponType === 'free_shipping') return 0
        if (couponType === 'percentage') return (subtotal * couponDiscount) / 100
        return couponDiscount
      },

      getShipping: () => {
        const { couponType } = get()
        if (couponType === 'free_shipping') return 0
        const subtotal = get().getSubtotal()
        if (subtotal >= 5000) return 0
        return 350
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        const shipping = get().getShipping()
        return subtotal - discount + shipping
      },

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'maison-cart' }
  )
)
