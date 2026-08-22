import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rateLimit'
import { clientIp, missingPaymentConfig, paymentsUnavailable } from '@/lib/payments'
import { fulfillOrder } from '@/lib/fulfillOrder'

const verifySchema = z.object({
  orderId:             z.string().uuid(),
  razorpay_order_id:   z.string().min(1).max(200),
  razorpay_payment_id: z.string().min(1).max(200),
  razorpay_signature:  z.string().min(1).max(500),
})

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`verify:${clientIp(req.headers)}`, 10, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const missing = missingPaymentConfig()
  if (missing.length) return paymentsUnavailable('checkout verification', missing)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const parsed = verifySchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data

  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, status, total, razorpay_order_id')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.razorpay_order_id !== razorpay_order_id) {
    return NextResponse.json({ error: 'Payment does not match order' }, { status: 400 })
  }

  // Verify Razorpay signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const actualBuf = Buffer.from(razorpay_signature, 'utf8')
  if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Verify payment amount via Razorpay API
  try {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    if (payment.status !== 'captured') return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    if (Number(payment.amount) !== Math.round(Number(order.total) * 100)) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify payment with Razorpay' }, { status: 502 })
  }

  // One transactional RPC claims the order and decrements every variant, or
  // rolls the whole thing back (H2). Idempotent: a replay returns success.
  const result = await fulfillOrder(admin, orderId, razorpay_payment_id)

  switch (result.status) {
    case 'confirmed':
    case 'already_fulfilled':
      return NextResponse.json({ success: true })
    case 'out_of_stock':
      return NextResponse.json(
        { error: 'Stock changed during payment. Your payment will be refunded — please contact support.' },
        { status: 409 }
      )
    case 'not_claimable':
      return NextResponse.json({ error: 'Order cannot be confirmed' }, { status: 409 })
    default:
      return NextResponse.json({ error: 'Could not complete your order. Please contact support.' }, { status: 500 })
  }
}
