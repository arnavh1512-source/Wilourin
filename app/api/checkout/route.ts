import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

interface CartItem {
  id: string
  variantId?: string
  name: string
  price: number
  quantity: number
  size: string
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!await rateLimit(`checkout:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, shipping, total: clientTotal } = await req.json()
  if (!items?.length || !shipping) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { name, phone, address, city, state, pincode } = shipping
  if (!name || !phone || !address || !city || !state || !pincode) {
    return NextResponse.json({ error: 'Please fill all fields' }, { status: 400 })
  }
  if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  if (!/^\d{6}$/.test(pincode)) return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 })

  const admin = createAdminClient()

  // Batch fetch all products — no N+1
  const productIds = (items as CartItem[]).map(i => i.id)
  const { data: dbProducts } = await admin
    .from('products')
    .select('id, name, price, product_variants(id, size, stock_qty)')
    .in('id', productIds)
    .eq('is_published', true)

  // Verify price + stock for every cart item
  let serverTotal = 0
  const verifiedItems: CartItem[] = []

  for (const item of items as CartItem[]) {
    if (!item.id || !item.name || item.quantity < 1 || item.quantity > 100) {
      return NextResponse.json({ error: 'Invalid item data' }, { status: 400 })
    }

    const product = dbProducts?.find(p => p.id === item.id)
    if (!product) return NextResponse.json({ error: `${item.name} is no longer available` }, { status: 400 })

    // Price tamper check
    if (product.price !== item.price) {
      return NextResponse.json({ error: `Price changed for ${item.name}. Please refresh your cart.` }, { status: 409 })
    }

    if (item.variantId) {
      const variant = (product.product_variants as { id: string; size: string; stock_qty: number }[])?.find(v => v.id === item.variantId)
      if (!variant || variant.stock_qty < item.quantity) {
        return NextResponse.json({ error: `${item.name} (Size ${item.size}) is out of stock` }, { status: 409 })
      }
    }

    serverTotal += product.price * item.quantity
    verifiedItems.push({ id: item.id, variantId: item.variantId, name: product.name, price: product.price, quantity: item.quantity, size: item.size })
  }

  // Total tamper check
  if (Math.abs(serverTotal - clientTotal) > 0.01) {
    return NextResponse.json({ error: 'Cart total mismatch. Please refresh.' }, { status: 409 })
  }

  const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(serverTotal * 100),
    currency: 'INR',
    receipt: `rcpt_${Date.now().toString(36)}`,
  })

  const { data: order, error: orderError } = await admin.from('orders').insert({
    user_id:           user.id,
    status:            'pending',
    total:             serverTotal,
    shipping_name:     shipping.name,
    shipping_phone:    shipping.phone,
    shipping_address:  shipping.address,
    shipping_city:     shipping.city,
    shipping_state:    shipping.state,
    shipping_pincode:  shipping.pincode,
    razorpay_order_id: rzpOrder.id,
  }).select().single()

  if (orderError || !order) return NextResponse.json({ error: orderError?.message ?? 'Failed to create order' }, { status: 500 })

  const { error: itemsError } = await admin.from('order_items').insert(
    verifiedItems.map(it => ({
      order_id:     order.id,
      product_id:   it.id,
      variant_id:   it.variantId ?? null,
      product_name: it.name,
      price:        it.price,
      quantity:     it.quantity,
      size:         it.size,
    }))
  )

  if (itemsError) {
    await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
  }

  return NextResponse.json({ orderId: order.id, rzpOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: process.env.RAZORPAY_KEY_ID })
}
