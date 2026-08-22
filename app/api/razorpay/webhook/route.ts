import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { fulfillOrder } from '@/lib/fulfillOrder'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET

  // Never disclose which piece of configuration is absent (H1).
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[razorpay:webhook] Rejected — missing RAZORPAY_WEBHOOK_SECRET or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ error: 'Payment system unavailable' }, { status: 503 })
  }

  // Verify webhook signature (constant time)
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const actualBuf = Buffer.from(signature, 'utf8')
  if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity
    if (!payment?.order_id) return NextResponse.json({ ok: true })

    const { data: order } = await admin
      .from('orders')
      .select('id')
      .eq('razorpay_order_id', payment.order_id)
      .maybeSingle()

    if (order) {
      // Same idempotent transactional RPC the browser verification uses (H2).
      const result = await fulfillOrder(admin, order.id, payment.id ?? null)
      if (result.status === 'out_of_stock' || result.status === 'error') {
        console.error(`[razorpay:webhook] Fulfilment failed for order ${order.id}: ${result.status}`)
        // 500 makes Razorpay retry; the RPC is safe to re-run.
        return NextResponse.json({ error: 'Fulfilment failed' }, { status: 500 })
      }
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload?.payment?.entity
    if (payment?.order_id) {
      await admin
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('razorpay_order_id', payment.order_id)
        .eq('status', 'pending')
    }
  }

  return NextResponse.json({ ok: true })
}
