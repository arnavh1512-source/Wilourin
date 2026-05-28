'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  cartItemId: string
  id: string
  variantId?: string
  name: string
  img: string
  price: number
  size: string
  quantity: number
  customFit?: Record<string, number>
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  add:       (item: Omit<CartItem, 'cartItemId'>) => void
  remove:    (cartItemId: string) => void
  updateQty: (cartItemId: string, qty: number) => void
  open:      () => void
  close:     () => void
  toggle:    () => void
  getTotal:  () => number
  getCount:  () => number
  clear:     () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (item) => set((s) => {
        const existing = s.items.findIndex(i => i.id === item.id && i.size === item.size)
        if (existing >= 0) {
          return {
            items: s.items.map((it, i) => i === existing ? { ...it, quantity: it.quantity + item.quantity } : it),
            isOpen: true,
          }
        }
        return { items: [...s.items, { ...item, cartItemId: crypto.randomUUID() }], isOpen: true }
      }),

      remove: (cartItemId) => set((s) => ({ items: s.items.filter(i => i.cartItemId !== cartItemId) })),

      updateQty: (cartItemId, qty) => set((s) => ({
        items: qty <= 0
          ? s.items.filter(i => i.cartItemId !== cartItemId)
          : s.items.map(it => it.cartItemId === cartItemId ? { ...it, quantity: qty } : it),
      })),

      open:     () => set({ isOpen: true }),
      close:    () => set({ isOpen: false }),
      toggle:   () => set((s) => ({ isOpen: !s.isOpen })),
      getTotal: () => get().items.reduce((sum, it) => sum + it.price * it.quantity, 0),
      getCount: () => get().items.reduce((sum, it) => sum + it.quantity, 0),
      clear:    () => set({ items: [], isOpen: false }),
    }),
    { name: 'wilourin-cart-v2' }
  )
)
