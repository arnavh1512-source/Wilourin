'use client'

import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  img: string
  price?: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  add: (item: CartItem) => void
  remove: (idx: number) => void
  open: () => void
  close: () => void
  toggle: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  isOpen: false,
  add:    (item) => set((s) => ({ items: [...s.items, item], isOpen: true })),
  remove: (idx)  => set((s) => ({ items: s.items.filter((_, i) => i !== idx) })),
  open:   ()     => set({ isOpen: true }),
  close:  ()     => set({ isOpen: false }),
  toggle: ()     => set((s) => ({ isOpen: !s.isOpen })),
}))
