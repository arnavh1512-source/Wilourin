'use client'

import { create } from 'zustand'

export interface CartItem {
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
  add:       (item: CartItem) => void
  remove:    (idx: number) => void
  updateQty: (idx: number, qty: number) => void
  open:      () => void
  close:     () => void
  toggle:    () => void
  getTotal:  () => number
  clear:     () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  add: (item) => set((s) => {
    const existing = s.items.findIndex(i => i.id === item.id && i.size === item.size)
    if (existing >= 0) {
      const items = s.items.map((it, i) => i === existing ? { ...it, quantity: it.quantity + item.quantity } : it)
      return { items, isOpen: true }
    }
    return { items: [...s.items, item], isOpen: true }
  }),
  remove:    (idx)      => set((s) => ({ items: s.items.filter((_, i) => i !== idx) })),
  updateQty: (idx, qty) => set((s) => ({
    items: qty <= 0
      ? s.items.filter((_, i) => i !== idx)
      : s.items.map((it, i) => i === idx ? { ...it, quantity: qty } : it),
  })),
  open:     () => set({ isOpen: true }),
  close:    () => set({ isOpen: false }),
  toggle:   () => set((s) => ({ isOpen: !s.isOpen })),
  getTotal: () => get().items.reduce((sum, it) => sum + it.price * it.quantity, 0),
  clear:    () => set({ items: [], isOpen: false }),
}))
