import type { SupabaseClient } from '@supabase/supabase-js'

export type FulfillStatus =
  | 'confirmed'
  | 'already_fulfilled'
  | 'not_claimable'
  | 'out_of_stock'
  | 'error'

export interface FulfillResult {
  status: FulfillStatus
  detail?: string
}

/**
 * Single entry point for order fulfilment, shared by the browser verification
 * route and the Razorpay webhook (H2). The database function claims the order
 * and decrements every variant inside one transaction, so concurrent callers
 * cannot double-decrement and an oversell aborts the confirmation entirely.
 */
export async function fulfillOrder(
  admin: SupabaseClient,
  orderId: string,
  paymentId: string | null
): Promise<FulfillResult> {
  const { data, error } = await admin.rpc('fulfill_order', {
    p_order_id: orderId,
    p_payment_id: paymentId,
  })

  if (error) {
    if (error.message?.includes('OUT_OF_STOCK')) {
      console.error(`[fulfillOrder] Oversell prevented for order ${orderId}: ${error.message}`)
      return { status: 'out_of_stock', detail: error.message }
    }
    console.error(`[fulfillOrder] Failed for order ${orderId}: ${error.message}`)
    return { status: 'error', detail: error.message }
  }

  const status = (data as { status?: string } | null)?.status
  if (status === 'confirmed' || status === 'already_fulfilled' || status === 'not_claimable') {
    return { status }
  }
  return { status: 'error' }
}
