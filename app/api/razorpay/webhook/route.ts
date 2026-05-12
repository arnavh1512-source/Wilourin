import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!secret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })

  // Verify webhook signature
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const admin = createAdminClient()

  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity
    if (!payment?.order_id) return NextResponse.json({ ok: true })

    // Find order by razorpay_order_id
    const { data: order } = await admin
      .from('orders')
      .select('id, status')
      .eq('razorpay_order_id', payment.order_id)
      .single()

    if (order && order.status === 'pending') {
      await admin.from('orders').update({
        status: 'confirmed',
        razorpay_payment_id: payment.id,
      }).eq('id', order.id)

      // Decrement stock atomically
      const { data: items } = await admin
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', order.id)

      for (const item of items ?? []) {
        if (item.variant_id) {
          await admin.rpc('decrement_stock', {
            p_variant_id: item.variant_id,
            p_qty: item.quantity,
          })
        }
      }
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload?.payment?.entity
    if (payment?.order_id) {
      await admin.from('orders')
        .update({ status: 'cancelled' })
        .eq('razorpay_order_id', payment.order_id)
        .eq('status', 'pending')
    }
  }

  return NextResponse.json({ ok: true })
}
