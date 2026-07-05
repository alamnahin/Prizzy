-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 003 — Fix order_items RLS infinite recursion + add shop_follows
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FIX: Infinite recursion in order_items RLS (PostgreSQL error 42P17)
--
--    Root cause:
--      Policy "Users can view own order items" on order_items queries orders.
--      Policy "Sellers can view relevant orders" on orders queries order_items.
--      This creates a mutual dependency → infinite recursion.
--
--    Fix:
--      Replace the cross-referencing policies with SECURITY DEFINER helper
--      functions that bypass RLS internally, breaking the cycle.
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1a: Drop the circular policies
DROP POLICY IF EXISTS "Users can view own order items"     ON public.order_items;
DROP POLICY IF EXISTS "Sellers can view relevant orders"  ON public.orders;

-- Step 1b: Helper function — returns order IDs that belong to auth.uid()
--   SECURITY DEFINER + search_path=public ensures it queries without RLS,
--   breaking the recursion entirely.
CREATE OR REPLACE FUNCTION public.get_user_order_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.orders WHERE user_id = auth.uid();
$$;

-- Step 1c: Helper function — returns order IDs visible to the current seller
CREATE OR REPLACE FUNCTION public.get_seller_order_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT oi.order_id
  FROM public.order_items oi
  JOIN public.sellers s ON oi.seller_id = s.id
  WHERE s.user_id = auth.uid();
$$;

-- Step 1d: Recreate order_items buyer policy (uses helper, no direct join to orders)
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (order_id IN (SELECT public.get_user_order_ids()));

-- Step 1e: Recreate orders seller policy (uses helper, no direct join to order_items)
CREATE POLICY "Sellers can view relevant orders"
  ON public.orders
  FOR SELECT
  USING (id IN (SELECT public.get_seller_order_ids()));


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ADD: shop_follows table (was missing — caused 404 errors)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shop_follows (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  seller_id  UUID NOT NULL REFERENCES public.sellers(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, seller_id)
);

CREATE INDEX IF NOT EXISTS shop_follows_user_idx   ON public.shop_follows(user_id);
CREATE INDEX IF NOT EXISTS shop_follows_seller_idx ON public.shop_follows(seller_id);

ALTER TABLE public.shop_follows ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see all follow counts (needed for follower count display)
CREATE POLICY "Anyone can view follow counts"
  ON public.shop_follows FOR SELECT
  USING (true);

-- Users can only insert their own follows
CREATE POLICY "Users can follow shops"
  ON public.shop_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only unfollow themselves
CREATE POLICY "Users can unfollow shops"
  ON public.shop_follows FOR DELETE
  USING (auth.uid() = user_id);
