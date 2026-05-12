'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  price: number
  img: string
  slug: string | null
}

interface WishlistStore {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  has: (id: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => set((s) => ({
        items: s.items.some(i => i.id === item.id)
          ? s.items.filter(i => i.id !== item.id)
          : [...s.items, item],
      })),
      has: (id) => get().items.some(i => i.id === id),
    }),
    { name: 'wilourin-wishlist' }
  )
)
