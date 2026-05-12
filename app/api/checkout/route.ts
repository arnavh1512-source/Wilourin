import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
  const admin = createAdminClient()

  // Auth
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, shipping, total } = await req.json()
  if (!items?.length || !shipping || !total) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  // Create Razorpay order
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  })

  // Create order in DB (pending)
  const { data: order, error } = await admin.from('orders').insert({
    user_id:       user.id,
    status:        'pending',
    total,
    shipping_name:    shipping.name,
    shipping_phone:   shipping.phone,
    shipping_address: shipping.address,
    shipping_city:    shipping.city,
    shipping_state:   shipping.state,
    shipping_pincode: shipping.pincode,
    razorpay_order_id: rzpOrder.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert order items
  await admin.from('order_items').insert(
    items.map((it: { id: string; name: string; price: number; quantity: number; size: string }) => ({
      order_id:     order.id,
      product_id:   it.id,
      product_name: it.name,
      price:        it.price,
      quantity:     it.quantity,
      size:         it.size,
    }))
  )

  return NextResponse.json({
    orderId:  order.id,
    rzpOrderId: rzpOrder.id,
    amount:   rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId:    process.env.RAZORPAY_KEY_ID,
  })
}
