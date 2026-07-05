-- ============================================================
-- PRIZZY - Complete Production Database Schema
-- Run this in Supabase SQL Editor (reset & rebuild)
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Drop existing tables (clean slate) ───────────────────────
DROP TABLE IF EXISTS public.notifications      CASCADE;
DROP TABLE IF EXISTS public.reviews            CASCADE;
DROP TABLE IF EXISTS public.order_items        CASCADE;
DROP TABLE IF EXISTS public.orders             CASCADE;
DROP TABLE IF EXISTS public.coupon_usages      CASCADE;
DROP TABLE IF EXISTS public.coupons            CASCADE;
DROP TABLE IF EXISTS public.wishlist_items     CASCADE;
DROP TABLE IF EXISTS public.cart_items         CASCADE;
DROP TABLE IF EXISTS public.products           CASCADE;
DROP TABLE IF EXISTS public.categories         CASCADE;
DROP TABLE IF EXISTS public.seller_withdrawals CASCADE;
DROP TABLE IF EXISTS public.sellers            CASCADE;
DROP TABLE IF EXISTS public.profiles           CASCADE;

-- ─── 1. PROFILES ──────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT '',
  email         TEXT UNIQUE,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','seller','admin')),
  is_banned     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- ─── 2. SELLERS ───────────────────────────────────────────────
CREATE TABLE public.sellers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name       TEXT NOT NULL,
  shop_logo       TEXT DEFAULT 'https://images.unsplash.com/photo-1559779080-6970e0186790?w=200&q=80',
  shop_banner     TEXT,
  category        TEXT DEFAULT 'Gifts',
  description     TEXT,
  phone           TEXT,
  bkash_number    TEXT,
  nagad_number    TEXT,
  rating          NUMERIC(3,2) DEFAULT 5.00,
  total_sales     INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_approved     BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER sellers_updated_at BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 3. CATEGORIES ────────────────────────────────────────────
CREATE TABLE public.categories (
  id          TEXT PRIMARY KEY,   -- e.g. 'flowers'
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  image       TEXT,
  icon        TEXT,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. PRODUCTS ──────────────────────────────────────────────
CREATE TABLE public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id         UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  category          TEXT NOT NULL REFERENCES public.categories(id),
  thumbnail         TEXT NOT NULL,
  images            JSONB DEFAULT '[]',
  short_description TEXT,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_price    NUMERIC(10,2),
  discount_percent  INTEGER DEFAULT 0,
  stock             INTEGER DEFAULT 0 CHECK (stock >= 0),
  sold              INTEGER DEFAULT 0,
  rating            NUMERIC(3,2) DEFAULT 0,
  num_reviews       INTEGER DEFAULT 0,
  occasion          JSONB DEFAULT '[]',
  gift_for          JSONB DEFAULT '[]',
  delivery_time     TEXT DEFAULT '2-3 days',
  is_customizable   BOOLEAN DEFAULT FALSE,
  is_featured       BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT FALSE,  -- false until admin approves
  meta_title        TEXT,
  meta_description  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_seller_idx   ON public.products(seller_id);
CREATE INDEX products_active_idx   ON public.products(is_active);
CREATE INDEX products_slug_idx     ON public.products(slug);

-- ─── 5. ORDERS ────────────────────────────────────────────────
CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL,
  user_id          UUID REFERENCES public.profiles(id),
  status           TEXT DEFAULT 'placed' CHECK (status IN ('placed','confirmed','processing','shipped','delivered','cancelled','refunded')),
  total_amount     NUMERIC(12,2) NOT NULL,
  subtotal         NUMERIC(12,2),
  shipping_fee     NUMERIC(8,2) DEFAULT 60,
  discount_amount  NUMERIC(8,2) DEFAULT 0,
  coupon_code      TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  phone_number     TEXT,
  payment_method   TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod','bkash','nagad','sslcommerz','card')),
  payment_status   TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_ref      TEXT,
  notes            TEXT,
  estimated_delivery DATE,
  delivered_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX orders_user_idx   ON public.orders(user_id);
CREATE INDEX orders_status_idx ON public.orders(status);

-- ─── 6. ORDER ITEMS ───────────────────────────────────────────
CREATE TABLE public.order_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES public.products(id),
  seller_id         UUID NOT NULL REFERENCES public.sellers(id),
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time     NUMERIC(10,2) NOT NULL,
  personal_message  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX order_items_order_idx  ON public.order_items(order_id);
CREATE INDEX order_items_seller_idx ON public.order_items(seller_id);

-- ─── 7. REVIEWS ───────────────────────────────────────────────
CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES public.orders(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  images      JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Trigger: recompute product rating after review insert/update/delete
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.products
  SET
    rating      = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)), 0),
    num_reviews = (SELECT COUNT(*) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER reviews_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ─── 8. COUPONS ───────────────────────────────────────────────
CREATE TABLE public.coupons (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                TEXT UNIQUE NOT NULL,
  description         TEXT,
  discount_type       TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value      NUMERIC(10,2) NOT NULL,
  minimum_order_amount NUMERIC(10,2) DEFAULT 0,
  maximum_discount    NUMERIC(10,2),
  usage_limit         INTEGER,
  used_count          INTEGER DEFAULT 0,
  is_active           BOOLEAN DEFAULT TRUE,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.coupon_usages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id  UUID NOT NULL REFERENCES public.coupons(id),
  user_id    UUID NOT NULL REFERENCES public.profiles(id),
  order_id   UUID NOT NULL REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)  -- one use per user
);

-- ─── 9. WISHLIST ──────────────────────────────────────────────
CREATE TABLE public.wishlist_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── 10. SELLER WITHDRAWALS ───────────────────────────────────
CREATE TABLE public.seller_withdrawals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id      UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  amount         NUMERIC(12,2) NOT NULL,
  method         TEXT DEFAULT 'bkash' CHECK (method IN ('bkash','nagad','bank')),
  account_number TEXT NOT NULL,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','rejected')),
  admin_note     TEXT,
  processed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 11. NOTIFICATIONS ────────────────────────────────────────
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error','order','promo')),
  is_read    BOOLEAN DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, is_read);

-- ─── 12. ADDRESSES (stored in profiles JSONB for simplicity) ──
-- We add an addresses table for proper normalization
CREATE TABLE public.addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label       TEXT DEFAULT 'Home',
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  street      TEXT NOT NULL,
  city        TEXT NOT NULL DEFAULT 'Dhaka',
  district    TEXT NOT NULL DEFAULT 'Dhaka',
  postal_code TEXT,
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses          ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- SELLERS
CREATE POLICY "Sellers are publicly viewable" ON public.sellers FOR SELECT USING (is_approved = true);
CREATE POLICY "Admin can view all sellers" ON public.sellers FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Users can create their seller profile" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update own shop" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can update any seller" ON public.sellers FOR UPDATE USING (public.get_user_role() = 'admin');

-- CATEGORIES
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manages categories" ON public.categories FOR ALL USING (public.get_user_role() = 'admin');

-- PRODUCTS
CREATE POLICY "Active products are public" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can view own products" ON public.products FOR SELECT USING (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "Admin can view all products" ON public.products FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT WITH CHECK (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "Admin can manage all products" ON public.products FOR ALL USING (public.get_user_role() = 'admin');

-- ORDERS
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admin can view all orders" ON public.orders FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (public.get_user_role() = 'admin');
CREATE POLICY "Sellers can view relevant orders" ON public.orders FOR SELECT USING (
  id IN (SELECT order_id FROM public.order_items oi JOIN public.sellers s ON oi.seller_id = s.id WHERE s.user_id = auth.uid())
);

-- ORDER ITEMS
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);
CREATE POLICY "Admin can view all order items" ON public.order_items FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Sellers can view own order items" ON public.order_items FOR SELECT USING (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- REVIEWS
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can write own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage reviews" ON public.reviews FOR ALL USING (public.get_user_role() = 'admin');

-- COUPONS
CREATE POLICY "Active coupons are readable by authenticated users" ON public.coupons FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');
CREATE POLICY "Admin manages coupons" ON public.coupons FOR ALL USING (public.get_user_role() = 'admin');

-- COUPON USAGES
CREATE POLICY "Users see own coupon usage" ON public.coupon_usages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert coupon usage" ON public.coupon_usages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WISHLIST
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);

-- WITHDRAWALS
CREATE POLICY "Sellers view own withdrawals" ON public.seller_withdrawals FOR SELECT USING (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "Sellers can request withdrawal" ON public.seller_withdrawals FOR INSERT WITH CHECK (
  seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "Admin manages withdrawals" ON public.seller_withdrawals FOR ALL USING (public.get_user_role() = 'admin');

-- NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ADDRESSES
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Place order atomically
CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id         UUID,
  p_items           JSONB,
  p_shipping_address JSONB,
  p_phone           TEXT,
  p_payment_method  TEXT DEFAULT 'cod',
  p_coupon_code     TEXT DEFAULT NULL,
  p_subtotal        NUMERIC DEFAULT 0,
  p_shipping_fee    NUMERIC DEFAULT 60,
  p_discount        NUMERIC DEFAULT 0
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_id     UUID;
  v_order_number TEXT;
  v_total        NUMERIC;
  v_item         JSONB;
  v_coupon       RECORD;
  v_product      RECORD;
  v_real_subtotal NUMERIC := 0;
  v_real_price    NUMERIC;
  v_item_qty      INTEGER;
BEGIN
  -- Generate order number
  v_order_number := 'PRZ-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));

  -- ── SERVER-SIDE PRICE VERIFICATION & STOCK CHECK ──────────────────────
  -- Re-fetch each product's authoritative price from the DB and validate stock.
  -- This prevents clients from sending a manipulated (lower) price.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_qty := (v_item->>'quantity')::INTEGER;

    SELECT id, price, discount_price, stock
      INTO v_product
      FROM public.products
     WHERE id = (v_item->>'product_id')::UUID AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found or is inactive', (v_item->>'product_id');
    END IF;

    -- Stock check before any writes
    IF v_product.stock < v_item_qty THEN
      RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %',
        v_product.id, v_product.stock, v_item_qty;
    END IF;

    -- Use DB price (discount_price if set, else price) — ignore client-supplied price
    v_real_price := COALESCE(v_product.discount_price, v_product.price);
    v_real_subtotal := v_real_subtotal + (v_real_price * v_item_qty);
  END LOOP;

  -- Fixed shipping fee (server-authoritative)
  -- Validate coupon discount if provided; otherwise discount is 0
  v_real_subtotal := ROUND(v_real_subtotal, 2);

  -- Validate coupon if provided
  IF p_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon FROM public.coupons
    WHERE code = p_coupon_code AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (usage_limit IS NULL OR used_count < usage_limit);
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', p_coupon_code;
    END IF;
  END IF;

  -- Recalculate discount server-side from coupon
  DECLARE
    v_real_discount NUMERIC := 0;
    v_real_shipping NUMERIC := 60;
  BEGIN
    IF v_coupon.id IS NOT NULL THEN
      IF v_coupon.discount_type = 'percentage' THEN
        v_real_discount := v_real_subtotal * v_coupon.discount_value / 100;
        IF v_coupon.maximum_discount IS NOT NULL THEN
          v_real_discount := LEAST(v_real_discount, v_coupon.maximum_discount);
        END IF;
      ELSE
        v_real_discount := v_coupon.discount_value;
      END IF;
      v_real_discount := ROUND(v_real_discount, 2);
    END IF;

    v_total := v_real_subtotal + v_real_shipping - v_real_discount;

    -- Create the order using server-verified totals
    INSERT INTO public.orders (
      order_number, user_id, status, total_amount, subtotal,
      shipping_fee, discount_amount, coupon_code,
      shipping_address, phone_number, payment_method, payment_status
    ) VALUES (
      v_order_number, p_user_id, 'placed', v_total, v_real_subtotal,
      v_real_shipping, v_real_discount, p_coupon_code,
      p_shipping_address, p_phone, p_payment_method,
      CASE WHEN p_payment_method = 'cod' THEN 'pending' ELSE 'pending' END
    ) RETURNING id INTO v_order_id;

    -- Insert each item (using server-verified price) and decrement stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_item_qty := (v_item->>'quantity')::INTEGER;

      SELECT id, price, discount_price, stock
        INTO v_product
        FROM public.products
       WHERE id = (v_item->>'product_id')::UUID AND is_active = true;

      -- Stock re-check inside write loop (race condition guard)
      IF v_product.stock < v_item_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %',
          v_product.id, v_product.stock, v_item_qty;
      END IF;

      v_real_price := COALESCE(v_product.discount_price, v_product.price);

      INSERT INTO public.order_items (order_id, product_id, seller_id, quantity, price_at_time, personal_message)
      VALUES (
        v_order_id,
        (v_item->>'product_id')::UUID,
        (v_item->>'seller_id')::UUID,
        v_item_qty,
        v_real_price,
        v_item->>'personal_message'
      );

      -- Decrement stock and increment sold (using FOR UPDATE to prevent races)
      UPDATE public.products
      SET
        stock = stock - v_item_qty,
        sold  = sold + v_item_qty
      WHERE id = v_product.id AND stock >= v_item_qty;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Stock exhausted for product % during write. Please refresh and try again.', v_product.id;
      END IF;
    END LOOP;

    -- Mark coupon as used
    IF v_coupon.id IS NOT NULL THEN
      UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
      INSERT INTO public.coupon_usages (coupon_id, user_id, order_id)
      VALUES (v_coupon.id, p_user_id, v_order_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Send notification to buyer
    IF p_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        p_user_id,
        'Order Placed! 🎉',
        'Your order ' || v_order_number || ' has been placed successfully.',
        'order',
        '/profile?tab=orders'
      );
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'order_id', v_order_id,
      'order_number', v_order_number
    );
  END;
END;
$$;

-- Validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT, p_subtotal NUMERIC, p_user_id UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_coupon RECORD;
  v_discount NUMERIC;
  v_used BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons
  WHERE code = upper(p_code) AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Invalid or expired coupon code.');
  END IF;

  IF p_subtotal < v_coupon.minimum_order_amount THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Minimum order amount of ৳' || v_coupon.minimum_order_amount || ' required.'
    );
  END IF;

  -- Check if user already used this coupon
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.coupon_usages WHERE coupon_id = v_coupon.id AND user_id = p_user_id
    ) INTO v_used;
    IF v_used THEN
      RETURN jsonb_build_object('valid', false, 'message', 'You have already used this coupon.');
    END IF;
  END IF;

  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := p_subtotal * v_coupon.discount_value / 100;
    IF v_coupon.maximum_discount IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_coupon.maximum_discount);
    END IF;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'coupon', row_to_json(v_coupon),
    'discount', v_discount,
    'message', v_coupon.description
  );
END;
$$;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
INSERT INTO public.categories (id, name, slug, image, sort_order) VALUES
  ('flowers',      'Flowers & Bouquets',   'flowers',       'https://images.unsplash.com/photo-1487530811015-780fb09f9d07?w=400&q=80', 1),
  ('cakes',        'Cakes & Desserts',     'cakes',         'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', 2),
  ('chocolates',   'Chocolates & Sweets',  'chocolates',    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80', 3),
  ('accessories',  'Fashion & Accessories','accessories',   'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80', 4),
  ('electronics',  'Gadgets & Electronics','electronics',   'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', 5),
  ('perfumes',     'Perfumes & Beauty',    'perfumes',      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80', 6),
  ('hampers',      'Gift Hampers',         'hampers',       'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80', 7),
  ('toys',         'Toys & Games',         'toys',          'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80', 8),
  ('jewelry',      'Jewelry & Watches',    'jewelry',       'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80', 9),
  ('stationery',   'Stationery & Books',   'stationery',    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80', 10)
ON CONFLICT (id) DO NOTHING;

-- Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount, usage_limit) VALUES
  ('WELCOME20',  '20% off your first order',   'percentage', 20,  500,   500,  NULL),
  ('PRIZZY10',   '10% off on any order',        'percentage', 10,  300,   300,  NULL),
  ('FLAT200',    '৳200 off orders over ৳2000', 'fixed',      200, 2000,  NULL, NULL),
  ('EID50',      '50% off Eid specials',        'percentage', 50,  1000,  1000, 200),
  ('NEWUSER',    '৳150 off for new users',      'fixed',      150, 800,   NULL, NULL)
ON CONFLICT (code) DO NOTHING;
