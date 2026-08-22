-- Atomic product variant + image replacement
-- Wraps delete-then-insert in a transaction so partial failure rolls back

CREATE OR REPLACE FUNCTION update_product_variants(
  p_product_id uuid,
  p_variants jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.product_variants WHERE product_id = p_product_id;
  IF jsonb_array_length(p_variants) > 0 THEN
    INSERT INTO public.product_variants (product_id, size, stock_qty)
    SELECT p_product_id, v->>'size', COALESCE((v->>'stock_qty')::int, 0)
    FROM jsonb_array_elements(p_variants) AS v;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_product_images(
  p_product_id uuid,
  p_images jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.product_images WHERE product_id = p_product_id;
  IF jsonb_array_length(p_images) > 0 THEN
    INSERT INTO public.product_images (product_id, url, is_primary, display_order)
    SELECT p_product_id, img->>'url', (img->>'is_primary')::boolean, (img->>'display_order')::int
    FROM jsonb_array_elements(p_images) AS img;
  END IF;
END;
$$;
