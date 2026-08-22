-- ─── H6: Fully transactional product create + update ─────────────────────────
-- Supersedes 004_product_update_rpc.sql (which was per-table only). Product
-- fields, images and variants are now written inside ONE transaction, so a
-- failure at any point leaves the catalogue exactly as it was.

-- One row per size per product — required by the ON CONFLICT upsert below and
-- a correctness constraint in its own right. Unreferenced duplicates are
-- collapsed first; if two duplicates are both referenced by orders the index
-- creation will fail loudly rather than corrupt inventory silently.
DELETE FROM public.product_variants a
 USING public.product_variants b
 WHERE a.product_id = b.product_id
   AND a.size = b.size
   AND a.ctid > b.ctid
   AND NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.variant_id = a.id);

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_product_size_key
  ON public.product_variants (product_id, size);

CREATE OR REPLACE FUNCTION public.slugify(p_text text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' FROM regexp_replace(regexp_replace(lower(coalesce(p_text, '')), '\s+', '-', 'g'), '[^a-z0-9-]', '', 'g'));
$$;

-- ── CREATE ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_product(
  p_product  jsonb,
  p_images   jsonb DEFAULT '[]'::jsonb,
  p_variants jsonb DEFAULT '[]'::jsonb
) RETURNS public.products
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_base    text;
  v_slug    text;
  v_n       int := 1;
  v_product public.products;
BEGIN
  v_base := NULLIF(public.slugify(p_product->>'name'), '');
  IF v_base IS NULL THEN
    RAISE EXCEPTION 'Product name must contain at least one alphanumeric character' USING ERRCODE = '22023';
  END IF;

  v_slug := v_base;
  WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = v_slug) LOOP
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
    IF v_n > 500 THEN
      RAISE EXCEPTION 'Could not generate a unique slug for %', v_base USING ERRCODE = '22023';
    END IF;
  END LOOP;

  INSERT INTO public.products (name, slug, description, price, original_price, category, badge, is_published)
  VALUES (
    p_product->>'name',
    v_slug,
    COALESCE(p_product->>'description', ''),
    (p_product->>'price')::numeric,
    NULLIF(p_product->>'original_price', '')::numeric,
    NULLIF(p_product->>'category', ''),
    NULLIF(p_product->>'badge', ''),
    COALESCE((p_product->>'is_published')::boolean, false)
  )
  RETURNING * INTO v_product;

  PERFORM public._write_product_children(v_product.id, p_images, p_variants);

  -- A published product with no image is invisible on the storefront (M6).
  IF v_product.is_published AND NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = v_product.id) THEN
    RAISE EXCEPTION 'A published product needs at least one image' USING ERRCODE = '23514';
  END IF;

  RETURN v_product;
END;
$$;

-- ── UPDATE ────────────────────────────────────────────────────────────────────
-- NULL p_images / p_variants means "leave untouched".
CREATE OR REPLACE FUNCTION public.update_product(
  p_id       uuid,
  p_product  jsonb DEFAULT '{}'::jsonb,
  p_images   jsonb DEFAULT NULL,
  p_variants jsonb DEFAULT NULL
) RETURNS public.products
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_product public.products;
BEGIN
  UPDATE public.products SET
    name           = COALESCE(p_product->>'name', name),
    description    = COALESCE(p_product->>'description', description),
    price          = COALESCE((p_product->>'price')::numeric, price),
    original_price = CASE WHEN p_product ? 'original_price' THEN NULLIF(p_product->>'original_price', '')::numeric ELSE original_price END,
    category       = CASE WHEN p_product ? 'category'       THEN NULLIF(p_product->>'category', '')       ELSE category END,
    badge          = CASE WHEN p_product ? 'badge'          THEN NULLIF(p_product->>'badge', '')          ELSE badge END,
    is_published   = COALESCE((p_product->>'is_published')::boolean, is_published)
  WHERE id = p_id
  RETURNING * INTO v_product;

  IF v_product.id IS NULL THEN
    RAISE EXCEPTION 'Product % not found', p_id USING ERRCODE = 'P0002';
  END IF;

  PERFORM public._write_product_children(p_id, p_images, p_variants);

  IF v_product.is_published AND NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = p_id) THEN
    RAISE EXCEPTION 'A published product needs at least one image' USING ERRCODE = '23514';
  END IF;

  RETURN v_product;
END;
$$;

-- ── SHARED CHILD WRITER ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._write_product_children(
  p_product_id uuid,
  p_images     jsonb,
  p_variants   jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_images IS NOT NULL THEN
    DELETE FROM public.product_images WHERE product_id = p_product_id;
    IF jsonb_array_length(p_images) > 0 THEN
      INSERT INTO public.product_images (product_id, url, is_primary, display_order)
      SELECT p_product_id, img->>'url',
             COALESCE((img->>'is_primary')::boolean, false),
             COALESCE((img->>'display_order')::int, 0)
      FROM jsonb_array_elements(p_images) AS img;
    END IF;
  END IF;

  IF p_variants IS NOT NULL THEN
    -- Upsert by (product_id, size) rather than delete-then-insert. order_items
    -- references product_variants ON DELETE SET NULL, so recreating rows would
    -- silently orphan pending orders and let them fulfil without decrementing
    -- stock. Keeping ids stable keeps history and fulfilment intact.
    INSERT INTO public.product_variants (product_id, size, stock_qty)
    SELECT p_product_id,
           trim(v->>'size'),
           GREATEST(0, COALESCE((v->>'stock_qty')::int, 0))
    FROM jsonb_array_elements(p_variants) AS v
    WHERE NULLIF(trim(v->>'size'), '') IS NOT NULL
    ON CONFLICT (product_id, size) DO UPDATE SET stock_qty = EXCLUDED.stock_qty;

    -- A removed size that an order still points at is zeroed, not deleted.
    UPDATE public.product_variants pv
       SET stock_qty = 0
     WHERE pv.product_id = p_product_id
       AND NOT EXISTS (
             SELECT 1 FROM jsonb_array_elements(p_variants) AS v
              WHERE trim(v->>'size') = pv.size)
       AND EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.variant_id = pv.id);

    -- Sizes with no order history are removed outright.
    DELETE FROM public.product_variants pv
     WHERE pv.product_id = p_product_id
       AND NOT EXISTS (
             SELECT 1 FROM jsonb_array_elements(p_variants) AS v
              WHERE trim(v->>'size') = pv.size)
       AND NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.variant_id = pv.id);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.create_product(jsonb, jsonb, jsonb)       FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_product(uuid, jsonb, jsonb, jsonb) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public._write_product_children(uuid, jsonb, jsonb) FROM public, anon, authenticated;

-- 004's narrower helpers are no longer used by the app.
DROP FUNCTION IF EXISTS public.update_product_variants(uuid, jsonb);
DROP FUNCTION IF EXISTS public.update_product_images(uuid, jsonb);
