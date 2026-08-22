export interface ShippingSettings {
  free_shipping_threshold: number
  shipping_cost: number
}

export const DEFAULT_SHIPPING: ShippingSettings = {
  free_shipping_threshold: 999,
  shipping_cost: 99,
}

/** Single source of truth for shipping, used by the checkout API and the UI. */
export function shippingFor(subtotal: number, settings: ShippingSettings = DEFAULT_SHIPPING): number {
  if (subtotal <= 0) return 0
  return subtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_cost
}
