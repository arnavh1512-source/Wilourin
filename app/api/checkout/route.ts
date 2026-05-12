import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!rateLimit(`checkout:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, shipping, total } = await req.json()
  if (!items?.length || !shipping || !total) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const admin = createAdminClient()

  // Verify stock before creating payment order
  const variantIds = items.map((it: { variantId?: string }) => it.variantId).filter(Boolean)
  if (variantIds.length) {
    const { data: variants } = await admin
      .from('product_variants')
      .select('id, stock_qty')
      .in('id', variantIds)

    for (const item of items as { variantId?: string; quantity: number; name: string }[]) {
      if (!item.variantId) continue
      const v = variants?.find(v => v.id === item.variantId)
      if (!v || v.stock_qty < item.quantity) {
        return NextResponse.json({ error: `${item.name} is out of stock or has insufficient quantity.` }, { status: 409 })
      }
    }
  }

  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const rzpOrder = await razorpay.orders.create({
    amount:   Math.round(total * 100),
    currency: 'INR',
    receipt:  `rcpt_${Date.now().toString(36)}`,
  })

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
