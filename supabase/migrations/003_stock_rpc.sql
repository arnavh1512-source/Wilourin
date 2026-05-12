-- Atomic stock decrement — prevents oversell race conditions
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id uuid, p_qty int)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.product_variants
  SET stock_qty = GREATEST(0, stock_qty - p_qty)
  WHERE id = p_variant_id;
$$;
