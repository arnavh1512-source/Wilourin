-- ─── H2: One idempotent, transactional fulfilment RPC ────────────────────────
-- Replaces the read-then-decrement sequence used by both the browser
-- verification route and the Razorpay webhook. The whole body runs in a single
-- transaction: if any variant lacks stock the exception rolls back the order
-- status change too, so an order is never confirmed against phantom inventory.

CREATE OR REPLACE FUNCTION public.fulfill_order(
  p_order_id   uuid,
  p_payment_id text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claimed int;
  v_updated int;
  v_item    record;
BEGIN
  -- 1. Claim the order exactly once. Concurrent callers: only one gets rowcount 1.
  UPDATE public.orders
     SET status = 'confirmed',
         razorpay_payment_id = COALESCE(p_payment_id, razorpay_payment_id)
   WHERE id = p_order_id
     AND status = 'pending';
  GET DIAGNOSTICS v_claimed = ROW_COUNT;

  IF v_claimed = 0 THEN
    IF EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id AND status <> 'pending' AND status <> 'cancelled') THEN
      RETURN jsonb_build_object('status', 'already_fulfilled');
    END IF;
    RETURN jsonb_build_object('status', 'not_claimable');
  END IF;

  -- 2. Decrement every variant conditionally, in a deterministic lock order.
  FOR v_item IN
    SELECT variant_id, quantity, product_name, size
      FROM public.order_items
     WHERE order_id = p_order_id
       AND variant_id IS NOT NULL
     ORDER BY variant_id
  LOOP
    UPDATE public.product_variants
       SET stock_qty = stock_qty - v_item.quantity
     WHERE id = v_item.variant_id
       AND stock_qty >= v_item.quantity;
    GET DIAGNOSTICS v_updated = ROW_COUNT;

    -- 3. Any shortfall aborts the transaction, undoing the confirm above.
    IF v_updated = 0 THEN
      RAISE EXCEPTION 'OUT_OF_STOCK: % (size %)',
        COALESCE(v_item.product_name, 'item'), COALESCE(v_item.size, '-')
        USING ERRCODE = '23514';
    END IF;
  END LOOP;

  RETURN jsonb_build_object('status', 'confirmed');
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_order(uuid, text) FROM public, anon, authenticated;

-- The unsafe clamping decrementer is gone; nothing may call it any more.
DROP FUNCTION IF EXISTS public.decrement_stock(uuid, int);
