import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  // Verify Razorpay signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Mark order confirmed
  await admin.from('orders').update({
    status: 'confirmed',
    razorpay_payment_id,
  }).eq('id', orderId)

  // Decrement stock for each variant ordered
  const { data: orderItems } = await admin
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', orderId)

  for (const item of orderItems ?? []) {
    if (!item.variant_id) continue
    const { data: variant } = await admin
      .from('product_variants')
      .select('stock_qty')
      .eq('id', item.variant_id)
      .single()
    if (variant) {
      await admin.from('product_variants').update({
        stock_qty: Math.max(0, variant.stock_qty - item.quantity),
      }).eq('id', item.variant_id)
    }
  }

  return NextResponse.json({ success: true })
}
