import Razorpay from 'razorpay'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface RefundRow {
  id: string
  order_id: string | null
  razorpay_payment_id: string
  razorpay_refund_id: string | null
  amount: number
  reason: string
  status: 'pending' | 'processing' | 'refunded' | 'failed' | 'resolved'
  attempts: number
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface RefundOutcome {
  /** The refund is recorded durably and will survive a crash or restart. */
  queued: boolean
  /** Razorpay accepted the refund in this call. */
  refunded: boolean
}

/**
 * Sends one refund to Razorpay and writes the result back to the queue row.
 * Shared by the automatic path and the admin retry button, so a refund is
 * recorded the same way however it was triggered.
 */
export async function attemptRefund(admin: SupabaseClient, refund: RefundRow): Promise<boolean> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  const now = new Date().toISOString()

  if (!keyId || !keySecret) {
    console.error(`[refund] Cannot refund payment ${refund.razorpay_payment_id} — Razorpay is not configured`)
    await admin.from('refunds').update({
      status: 'failed',
      last_error: 'Razorpay is not configured on the server.',
      updated_at: now,
    }).eq('id', refund.id)
    return false
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const result = await razorpay.payments.refund(refund.razorpay_payment_id, {
      amount: Math.round(Number(refund.amount) * 100),
      speed: 'normal',
      notes: { order_id: refund.order_id ?? '', reason: refund.reason },
    })
    await admin.from('refunds').update({
      status: 'refunded',
      razorpay_refund_id: result.id,
      attempts: refund.attempts + 1,
      last_error: null,
      updated_at: now,
    }).eq('id', refund.id)
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown Razorpay error'
    console.error(`[refund] Razorpay refund failed for payment ${refund.razorpay_payment_id}: ${message}`)
    await admin.from('refunds').update({
      status: 'failed',
      attempts: refund.attempts + 1,
      last_error: message.slice(0, 500),
      updated_at: now,
    }).eq('id', refund.id)
    return false
  }
}

/**
 * A captured payment whose order cannot be fulfilled must not simply fail —
 * the customer has already paid (R2). The refund is recorded durably first, so
 * it survives a crash or a Razorpay outage and shows up in the admin queue,
 * and only then attempted. Idempotent on the payment id.
 */
export async function refundCapturedPayment(
  admin: SupabaseClient,
  orderId: string,
  paymentId: string,
  reason: string
): Promise<RefundOutcome> {
  const { data, error } = await admin.rpc('record_failed_fulfillment', {
    p_order_id: orderId,
    p_payment_id: paymentId,
    p_reason: reason,
  })

  if (error) {
    console.error(`[refund] Could not queue a refund for payment ${paymentId}: ${error.message}`)
    return { queued: false, refunded: false }
  }

  const queued = data as { status?: string; refund_id?: string; state?: string; claimed?: boolean } | null
  if (queued?.status !== 'queued' || !queued.refund_id) {
    console.error(`[refund] Refund not queued for payment ${paymentId}: ${queued?.status ?? 'no result'}`)
    return { queued: false, refunded: false }
  }

  // Another caller holds the claim, or the payment is already settled. Either
  // way this caller must not send a second refund to Razorpay.
  if (!queued.claimed) {
    return { queued: true, refunded: queued.state === 'refunded' }
  }

  const { data: row } = await admin.from('refunds').select('*').eq('id', queued.refund_id).single<RefundRow>()
  if (!row) return { queued: true, refunded: false }

  return { queued: true, refunded: await attemptRefund(admin, row) }
}
