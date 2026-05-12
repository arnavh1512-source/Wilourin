import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  // Verify Razorpay payment signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Replay protection — if already confirmed, stock was already decremented
  const { data: existingOrder } = await admin.from('orders').select('status').eq('id', orderId).single()
  if (existingOrder?.status === 'confirmed') {
    return NextResponse.json({ success: true })
  }

  await admin.from('orders').update({
    status: 'confirmed',
    razorpay_payment_id,
  }).eq('id', orderId)

  // Atomically decrement stock via DB function (no race condition)
  const { data: orderItems } = await admin
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', orderId)

  for (const item of orderItems ?? []) {
    if (item.variant_id) {
      await admin.rpc('decrement_stock', {
        p_variant_id: item.variant_id,
        p_qty: item.quantity,
      })
    }
  }

  return NextResponse.json({ success: true })
}
