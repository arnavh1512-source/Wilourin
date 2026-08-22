'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_SHIPPING, type ShippingSettings } from '@/lib/shipping'

/**
 * Reads the same shipping rule the checkout API enforces, so the storefront
 * never promises a price the server will not honour (M4). site_settings is
 * publicly readable, so this needs no auth.
 */
export function useShippingSettings(): ShippingSettings {
  const [settings, setSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING)

  useEffect(() => {
    let active = true
    createClient()
      .from('site_settings')
      .select('free_shipping_threshold, shipping_cost')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (!active || !data) return
        setSettings({
          free_shipping_threshold: Number(data.free_shipping_threshold ?? DEFAULT_SHIPPING.free_shipping_threshold),
          shipping_cost: Number(data.shipping_cost ?? DEFAULT_SHIPPING.shipping_cost),
        })
      })
    return () => { active = false }
  }, [])

  return settings
}
