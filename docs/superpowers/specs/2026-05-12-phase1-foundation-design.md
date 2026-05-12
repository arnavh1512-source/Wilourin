# Wilourin — Phase 1: Foundation Design
**Date:** 2026-05-12  
**Status:** Approved

## Overview
Set up Supabase backend, Google Sign-In, protected routes, and database schema so all subsequent phases (products, checkout, admin) can be built on top.

## Architecture: Mix pattern (C)
- Public product reads: Supabase client (browser) → direct query, RLS allows public read
- Protected writes (orders, admin): Next.js API routes → Supabase service key server-side
- Auth: Supabase Auth + Google OAuth provider

## Database Schema

### profiles
Extends auth.users. Created automatically on first sign-in via trigger.
- id uuid PK (FK auth.users)
- full_name text
- phone text
- role text default 'customer' — values: 'customer' | 'admin'
- created_at timestamptz

### products
- id uuid PK default gen_random_uuid()
- name text NOT NULL
- slug text UNIQUE NOT NULL
- description text
- price numeric NOT NULL
- original_price numeric
- category text
- badge text
- is_published boolean default false
- created_at timestamptz default now()

### product_images
- id uuid PK
- product_id uuid FK products
- url text NOT NULL
- is_primary boolean default false
- display_order int default 0

### product_variants
- id uuid PK
- product_id uuid FK products
- size text NOT NULL (XS/S/M/L/XL)
- color_name text
- color_hex text
- stock_qty int default 0
- sku text

### orders
- id uuid PK
- user_id uuid FK auth.users (nullable — future guest support)
- status text default 'pending' — pending|confirmed|processing|shipped|delivered|cancelled
- subtotal numeric
- shipping_cost numeric default 0
- total numeric
- razorpay_order_id text
- razorpay_payment_id text
- shipping_name text
- shipping_phone text
- shipping_address text
- shipping_city text
- shipping_state text
- shipping_pincode text
- notes text
- created_at timestamptz default now()

### order_items
- id uuid PK
- order_id uuid FK orders
- product_id uuid FK products
- variant_id uuid FK product_variants (nullable)
- product_name text (denormalized snapshot)
- size text
- color_name text
- price numeric
- quantity int
- custom_fit jsonb — { dress_length, waist, hip, blazer_length, unit: "in"|"cm" }

### site_settings
Single row (id=1), admin-editable.
- id int PK default 1
- hero_video_url text
- hero_headline text
- featured_product_ids uuid[]
- free_shipping_threshold numeric default 999
- shipping_cost numeric default 99

## RLS Policies
- profiles: users can read/update own row. Service role bypasses all.
- products: public can read published. Only service role writes.
- product_images, product_variants: public read. Service role writes.
- orders: users can read own orders. Service role writes.
- order_items: users can read own (via order join). Service role writes.
- site_settings: public read. Service role writes.

## Auth Flow
1. User clicks "Continue with Google"
2. Supabase redirects to Google consent screen
3. Google redirects to /auth/callback with code
4. Supabase exchanges code for session, creates auth.users row
5. DB trigger auto-creates profiles row with role='customer'
6. User redirected to / (or /account if post-checkout)

## Route Protection (Middleware)
- /admin/* — requires role='admin', redirect to / if not
- /account/* — requires auth, redirect to /login if not
- /checkout — requires auth, redirect to /login?next=/checkout if not

## Admin Role Management
- Admin can view all profiles in admin panel
- Admin can toggle any user's role between 'customer' and 'admin'
- First admin must be set manually in Supabase dashboard (set role='admin' for your email)

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- RAZORPAY_KEY_ID (Phase 3)
- RAZORPAY_KEY_SECRET (Phase 3)
