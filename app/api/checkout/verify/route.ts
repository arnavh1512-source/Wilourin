import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

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
  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Verify payment amount via Razorpay API
  const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    if (payment.status !== 'captured') return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    if (Number(payment.amount) !== Math.round(order.total * 100)) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify payment with Razorpay' }, { status: 502 })
  }

  // Atomic update: only confirm if still pending (prevents race conditions + replay)
  const { data: updated } = await admin
    .from('orders')
    .update({ status: 'confirmed', razorpay_payment_id })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select()
    .single()

  if (!updated) {
    const { data: existing } = await admin.from('orders').select('status').eq('id', orderId).single()
    if (existing?.status === 'confirmed') return NextResponse.json({ success: true })
    return NextResponse.json({ error: 'Order cannot be confirmed' }, { status: 409 })
  }

  // Decrement stock atomically
  const { data: orderItems } = await admin.from('order_items').select('variant_id, quantity').eq('order_id', orderId)
  for (const item of orderItems ?? []) {
    if (item.variant_id) {
      const { error } = await admin.rpc('decrement_stock', { p_variant_id: item.variant_id, p_qty: item.quantity })
      if (error) console.error('Stock decrement failed for variant', item.variant_id, error)
    }
  }

  return NextResponse.json({ success: true })
}
