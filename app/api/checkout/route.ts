import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Auth via cookies — secure server-side session read
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, shipping, total } = await req.json()
  if (!items?.length || !shipping || !total) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const rzpOrder = await razorpay.orders.create({
    amount:   Math.round(total * 100),
    currency: 'INR',
    receipt:  `rcpt_${Date.now().toString(36)}`,
  })

  const admin = createAdminClient()
  const { data: order, error } = await admin.from('orders').insert({
    user_id:           user.id,
    status:            'pending',
    total,
    shipping_name:     shipping.name,
    shipping_phone:    shipping.phone,
    shipping_address:  shipping.address,
    shipping_city:     shipping.city,
    shipping_state:    shipping.state,
    shipping_pincode:  shipping.pincode,
    razorpay_order_id: rzpOrder.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('order_items').insert(
    items.map((it: { id: string; variantId?: string; name: string; price: number; quantity: number; size: string }) => ({
      order_id:     order.id,
      product_id:   it.id,
      variant_id:   it.variantId ?? null,
      product_name: it.name,
      price:        it.price,
      quantity:     it.quantity,
      size:         it.size,
    }))
  )

  return NextResponse.json({
    orderId:    order.id,
    rzpOrderId: rzpOrder.id,
    amount:     rzpOrder.amount,
    currency:   rzpOrder.currency,
    keyId:      process.env.RAZORPAY_KEY_ID,
  })
}
