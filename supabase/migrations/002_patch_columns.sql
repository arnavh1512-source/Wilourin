-- ── Safe column patches — run this if products/orders were created before 001 ──

-- Products: add missing columns
alter table public.products add column if not exists description      text;
alter table public.products add column if not exists original_price   numeric(10,2);
alter table public.products add column if not exists category         text;
alter table public.products add column if not exists badge            text;
alter table public.products add column if not exists is_published     boolean not null default false;

-- Orders: ensure total column exists (some early schemas used subtotal only)
alter table public.orders add column if not exists total              numeric(10,2) not null default 0;
alter table public.orders add column if not exists razorpay_order_id  text;
alter table public.orders add column if not exists razorpay_payment_id text;
alter table public.orders add column if not exists shipping_name      text;
alter table public.orders add column if not exists shipping_phone     text;
alter table public.orders add column if not exists shipping_address   text;
alter table public.orders add column if not exists shipping_city      text;
alter table public.orders add column if not exists shipping_state     text;
alter table public.orders add column if not exists shipping_pincode   text;
