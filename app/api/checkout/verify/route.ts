import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body).digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Mark order as confirmed
  const admin = createAdminClient()
  await admin.from('orders').update({
    status: 'confirmed',
    razorpay_payment_id,
  }).eq('id', orderId)

  return NextResponse.json({ success: true })
}
