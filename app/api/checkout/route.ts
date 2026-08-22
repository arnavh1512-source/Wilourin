import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { clientIp, missingPaymentConfig, paymentsUnavailable } from '@/lib/payments'
import { DEFAULT_SHIPPING, shippingFor } from '@/lib/shipping'
import { FIT_BOUNDS, FIT_KEYS } from '@/lib/fitBounds'

/** Only the four UI-supported measures, each bounded and step-aligned (M1). */
const customFitSchema = z
  .object(
    Object.fromEntries(
      FIT_KEYS.map(k => [
        k,
        z
          .number()
          .min(FIT_BOUNDS[k].min)
          .max(FIT_BOUNDS[k].max)
          .refine(v => Number.isInteger(v / FIT_BOUNDS[k].step), `${k} must use ${FIT_BOUNDS[k].step} inch steps`)
          .optional(),
      ])
    ) as Record<(typeof FIT_KEYS)[number], z.ZodOptional<z.ZodNumber>>
  )
  .strict()

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id:        z.string().uuid(),
        variantId: z.string().uuid({ message: 'Please re-select a size for every item in your bag.' }),
        price:     z.number().nonnegative().max(9_999_999),
        quantity:  z.number().int().min(1).max(20),
        customFit: customFitSchema.nullish(),
      })
    )
    .min(1)
    .max(50),
  shipping: z.object({
    name:    z.string().trim().min(1).max(120),
    phone:   z.string().trim().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    address: z.string().trim().min(1).max(500),
    city:    z.string().trim().min(1).max(100),
    state:   z.string().trim().min(1).max(100),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Invalid pincode'),
  }),
  subtotal: z.number().nonnegative().max(99_999_999).optional(),
})

type Variant = { id: string; size: string; stock_qty: number }

export async function POST(req: NextRequest) {
  // Auth first — an anonymous probe must never reach the rate limiter or the
  // payment gateway (H1).
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await rateLimit(`checkout:${user.id}:${clientIp(req.headers)}`, 5, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const missing = missingPaymentConfig()
  if (missing.length) return paymentsUnavailable('checkout', missing)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }
  const { items, shipping, subtotal: clientSubtotal } = parsed.data

  const admin = createAdminClient()

  // Batch fetch all products — no N+1
  const { data: dbProducts } = await admin
    .from('products')
    .select('id, name, price, product_variants(id, size, stock_qty)')
    .in('id', items.map(i => i.id))
    .eq('is_published', true)

  let subtotal = 0
  const verifiedItems: {
    id: string
    variantId: string
    name: string
    price: number
    quantity: number
    size: string
    customFit: Record<string, number> | null
  }[] = []

  for (const item of items) {
    const product = dbProducts?.find(p => p.id === item.id)
    if (!product) return NextResponse.json({ error: 'An item in your bag is no longer available.' }, { status: 400 })

    if (Number(product.price) !== item.price) {
      return NextResponse.json({ error: `Price changed for ${product.name}. Please refresh your cart.` }, { status: 409 })
    }

    // Every sellable line must resolve to a real, in-stock variant of THIS
    // product. Size comes from the database, never from the client (H3).
    const variant = (product.product_variants as Variant[] | null)?.find(v => v.id === item.variantId)
    if (!variant) {
      return NextResponse.json({ error: `${product.name} is no longer available in the size you selected.` }, { status: 409 })
    }
    if (variant.stock_qty < item.quantity) {
      return NextResponse.json({ error: `${product.name} (Size ${variant.size}) is out of stock.` }, { status: 409 })
    }

    subtotal += Number(product.price) * item.quantity
    verifiedItems.push({
      id:        product.id,
      variantId: variant.id,
      name:      product.name,
      price:     Number(product.price),
      quantity:  item.quantity,
      size:      variant.size,
      customFit: item.customFit && Object.keys(item.customFit).length > 0 ? item.customFit : null,
    })
  }

  if (clientSubtotal !== undefined && Math.abs(subtotal - clientSubtotal) > 0.01) {
    return NextResponse.json({ error: 'Cart total mismatch. Please refresh.' }, { status: 409 })
  }

  // Shipping is decided server-side from site_settings (M4).
  const { data: settings } = await admin
    .from('site_settings')
    .select('free_shipping_threshold, shipping_cost')
    .eq('id', 1)
    .maybeSingle()

  const shippingCost = shippingFor(subtotal, {
    free_shipping_threshold: Number(settings?.free_shipping_threshold ?? DEFAULT_SHIPPING.free_shipping_threshold),
    shipping_cost:           Number(settings?.shipping_cost ?? DEFAULT_SHIPPING.shipping_cost),
  })
  const total = Math.round((subtotal + shippingCost) * 100) / 100

  let rzpOrder
  try {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
    rzpOrder = await razorpay.orders.create({
      amount:   Math.round(total * 100),
      currency: 'INR',
      receipt:  `rcpt_${Date.now().toString(36)}`,
    })
  } catch (err) {
    console.error('[checkout] Razorpay order creation failed:', err instanceof Error ? err.message : 'unknown error')
    return NextResponse.json({ error: 'Payment system unavailable' }, { status: 503 })
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id:           user.id,
      status:            'pending',
      subtotal,
      shipping_cost:     shippingCost,
      total,
      shipping_name:     shipping.name,
      shipping_phone:    shipping.phone,
      shipping_address:  shipping.address,
      shipping_city:     shipping.city,
      shipping_state:    shipping.state,
      shipping_pincode:  shipping.pincode,
      razorpay_order_id: rzpOrder.id,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[checkout] Failed to create order:', orderError?.message)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const { error: itemsError } = await admin.from('order_items').insert(
    verifiedItems.map(it => ({
      order_id:     order.id,
      product_id:   it.id,
      variant_id:   it.variantId,
      product_name: it.name,
      price:        it.price,
      quantity:     it.quantity,
      size:         it.size,
      custom_fit:   it.customFit,
    }))
  )

  if (itemsError) {
    await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    console.error('[checkout] Failed to create order items:', itemsError.message)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  return NextResponse.json({
    orderId:    order.id,
    rzpOrderId: rzpOrder.id,
    amount:     rzpOrder.amount,
    currency:   rzpOrder.currency,
    keyId:      process.env.RAZORPAY_KEY_ID,
    subtotal,
    shippingCost,
    total,
  })
}
