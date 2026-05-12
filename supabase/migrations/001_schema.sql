-- ─── WILOURIN — Full Schema Migration ───────────────────────────────────────
-- Run this once in Supabase Dashboard → SQL Editor → New query → Paste → Run

-- ── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  description     text,
  price           numeric(10,2) not null default 0,
  original_price  numeric(10,2),
  category        text,
  badge           text,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── PRODUCT IMAGES ────────────────────────────────────────────────────────────
create table if not exists public.product_images (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  url            text not null,
  is_primary     boolean not null default false,
  display_order  int not null default 0
);

-- ── PRODUCT VARIANTS ──────────────────────────────────────────────────────────
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  size        text not null,
  color_name  text,
  color_hex   text,
  stock_qty   int not null default 0,
  sku         text
);

-- ── ORDERS ────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete set null,
  status                text not null default 'pending'
                          check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal              numeric(10,2) not null default 0,
  shipping_cost         numeric(10,2) not null default 0,
  total                 numeric(10,2) not null default 0,
  razorpay_order_id     text,
  razorpay_payment_id   text,
  shipping_name         text,
  shipping_phone        text,
  shipping_address      text,
  shipping_city         text,
  shipping_state        text,
  shipping_pincode      text,
  notes                 text,
  created_at            timestamptz not null default now()
);

-- ── ORDER ITEMS ───────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  variant_id    uuid references public.product_variants(id) on delete set null,
  product_name  text not null,
  size          text,
  color_name    text,
  price         numeric(10,2) not null,
  quantity      int not null default 1,
  custom_fit    jsonb
);

-- ── SITE SETTINGS ─────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  id                       int primary key default 1 check (id = 1),
  hero_video_url           text,
  hero_headline            text,
  featured_product_ids     uuid[],
  free_shipping_threshold  numeric(10,2) default 999,
  shipping_cost            numeric(10,2) default 99
);

insert into public.site_settings (id) values (1) on conflict do nothing;

-- ── RLS POLICIES ──────────────────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.site_settings   enable row level security;

-- profiles
create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- products — public read for published
create policy "Public read published products" on public.products for select using (is_published = true);

-- product_images / variants — public read
create policy "Public read product images"   on public.product_images   for select using (true);
create policy "Public read product variants" on public.product_variants for select using (true);

-- orders — users read own
create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);

-- order_items — users read own via order
create policy "Users read own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- site_settings — public read
create policy "Public read site settings" on public.site_settings for select using (true);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
create index if not exists idx_products_slug        on public.products(slug);
create index if not exists idx_products_published   on public.products(is_published);
create index if not exists idx_variants_product     on public.product_variants(product_id);
create index if not exists idx_images_product       on public.product_images(product_id);
create index if not exists idx_orders_user          on public.orders(user_id);
create index if not exists idx_order_items_order    on public.order_items(order_id);
