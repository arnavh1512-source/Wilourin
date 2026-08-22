-- ─── R2: durable refund queue for post-capture fulfilment failures ────────────
-- fulfill_order() correctly refuses to confirm an order it cannot stock, but by
-- then Razorpay has already captured the customer's money. The rollback leaves
-- no trace of that capture, so the payment needs a durable home of its own.

CREATE TABLE IF NOT EXISTS public.refunds (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  -- The captured payment is the idempotency key: a webhook retry and the
  -- browser callback for the same payment must queue one refund, not two.
  razorpay_payment_id text NOT NULL UNIQUE,
  razorpay_refund_id  text,
  amount              numeric(10,2) NOT NULL CHECK (amount >= 0),
  reason              text NOT NULL,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processing', 'refunded', 'failed', 'resolved')),
  attempts            int  NOT NULL DEFAULT 0,
  last_error          text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_open ON public.refunds (status, created_at DESC);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.refunds FROM anon, authenticated;
-- No policies by design: money movement is service-role only, and the service
-- role bypasses RLS. The admin UI reads this through a server route.

CREATE OR REPLACE FUNCTION public.record_failed_fulfillment(
  p_order_id   uuid,
  p_payment_id text,
  p_reason     text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total  numeric(10,2);
  v_refund public.refunds%ROWTYPE;
BEGIN
  SELECT total INTO v_total FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'order_not_found');
  END IF;

  INSERT INTO public.refunds (order_id, razorpay_payment_id, amount, reason)
  VALUES (p_order_id, p_payment_id, v_total, p_reason)
  ON CONFLICT (razorpay_payment_id) DO NOTHING;

  -- Claim it. The webhook and the browser callback for one payment can arrive
  -- at the same instant; only the caller that wins this conditional update is
  -- allowed to talk to Razorpay, so the customer is never refunded twice.
  UPDATE public.refunds
     SET status = 'processing', updated_at = now()
   WHERE razorpay_payment_id = p_payment_id
     AND status = 'pending'
  RETURNING * INTO v_refund;

  IF NOT FOUND THEN
    SELECT * INTO v_refund FROM public.refunds WHERE razorpay_payment_id = p_payment_id;
    RETURN jsonb_build_object(
      'status',    'queued',
      'refund_id', v_refund.id,
      'amount',    v_refund.amount,
      'state',     v_refund.status,
      'claimed',   false
    );
  END IF;

  -- The fulfilment transaction rolled back, so the order is 'pending' again.
  -- It can never be fulfilled, and leaving it pending would let a later webhook
  -- retry claim it against inventory the customer has already been refunded for.
  UPDATE public.orders
     SET status = 'cancelled',
         razorpay_payment_id = COALESCE(p_payment_id, razorpay_payment_id)
   WHERE id = p_order_id
     AND status = 'pending';

  RETURN jsonb_build_object(
    'status',    'queued',
    'refund_id', v_refund.id,
    'amount',    v_refund.amount,
    'state',     v_refund.status,
    'claimed',   true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_failed_fulfillment(uuid, text, text) FROM public, anon, authenticated;
