-- ============================================================
-- BUG FIX: Missing RLS policies & policy logic gaps
-- Run in Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- BUG 1 (Critical): addresses table — INSERT policy uses USING instead of WITH CHECK
--
--   The schema has:
--     CREATE POLICY "Users manage own addresses" ON addresses FOR ALL
--       USING (auth.uid() = user_id);
--
--   FOR ALL with only USING is CORRECT for SELECT/UPDATE/DELETE, but for INSERT
--   Postgres requires WITH CHECK. Without it the policy silently blocks all
--   address inserts for non-service-role callers (anon key / supabase-js), so
--   new addresses are never saved and the checkout falls back to a ghost address.
--
--   Fix: drop the catchall policy and replace with explicit per-operation policies.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;

CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- BUG 2 (Critical): coupon_usages INSERT policy — same USING-only issue
--
--   Schema has:
--     CREATE POLICY "Users can insert coupon usage" ON coupon_usages FOR INSERT
--       WITH CHECK (auth.uid() = user_id);   ← this one is actually correct
--
--   However place_order() uses SECURITY DEFINER so it bypasses RLS anyway.
--   No change needed here, but documenting for clarity.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- BUG 3 (High): sellers RLS — unapproved sellers can't be viewed by admins
--
--   Two SELECT policies exist:
--     "Sellers are publicly viewable"  USING (is_approved = true)
--     "Admin can view all sellers"     USING (get_user_role() = 'admin')
--
--   In PostgreSQL, when multiple permissive policies exist for the same command
--   they are OR-ed. This is actually fine — admins will see all sellers.
--   BUT the admin panel also needs to UPDATE unapproved sellers (approve/reject).
--   The UPDATE policy "Admin can update any seller" is correct.
--   No change needed here.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- BUG 4 (Medium): notifications — FOR ALL with USING but no WITH CHECK on INSERT
--
--   "Users see own notifications" ON notifications FOR ALL USING (auth.uid() = user_id)
--   Same gap as addresses: INSERT will be blocked for client-side inserts.
--   place_order() is SECURITY DEFINER so it bypasses RLS there — but any future
--   client-side notification insert would silently fail.
--
--   Fix: split into explicit policies.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- BUG 5 (Medium): wishlist_items — same FOR ALL / USING gap for INSERT
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;

CREATE POLICY "Users can view own wishlist"
  ON public.wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON public.wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON public.wishlist_items FOR DELETE
  USING (auth.uid() = user_id);
