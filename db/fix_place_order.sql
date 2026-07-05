-- ============================================================
-- BUG FIX: place_order RPC — two bugs
--
-- BUG 1 (Critical): Coupon code case-sensitivity mismatch
--   validate_coupon normalises input with upper(p_code), so coupons
--   are stored and matched in UPPER CASE.  But place_order compares
--   `code = p_coupon_code` (raw, no upper()), so coupon validation
--   silently fails and the order is placed without any discount.
--   Fix: wrap p_coupon_code in upper() in the WHERE clause.
--
-- BUG 2 (Critical): Nested DECLARE block inside BEGIN (invalid PL/pgSQL)
--   PL/pgSQL only allows DECLARE at the start of a block, not inside
--   an already-open BEGIN…END.  The nested DECLARE v_real_discount /
--   v_real_shipping block will cause a syntax error on some Postgres
--   versions and unpredictable behaviour on others.
--   Fix: declare v_real_discount and v_real_shipping at the top of the
--   outer DECLARE section (with the other variables) and remove the
--   inner DECLARE…BEGIN…END wrapper, keeping the logic flat.
-- ============================================================

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
  v_order_id      UUID;
  v_order_number  TEXT;
  v_total         NUMERIC;
  v_item          JSONB;
  v_coupon        RECORD;
  v_product       RECORD;
  v_real_subtotal  NUMERIC := 0;
  v_real_price     NUMERIC;
  v_item_qty       INTEGER;
  -- FIX BUG 2: declare these at the outer level, not in a nested DECLARE block
  v_real_discount  NUMERIC := 0;
  v_real_shipping  NUMERIC := 60;
BEGIN
  -- Generate order number
  v_order_number := 'PRZ-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));

  -- ── SERVER-SIDE PRICE VERIFICATION & STOCK CHECK ────────────────────────
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

    IF v_product.stock < v_item_qty THEN
      RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %',
        v_product.id, v_product.stock, v_item_qty;
    END IF;

    v_real_price    := COALESCE(v_product.discount_price, v_product.price);
    v_real_subtotal := v_real_subtotal + (v_real_price * v_item_qty);
  END LOOP;

  v_real_subtotal := ROUND(v_real_subtotal, 2);

  -- Validate coupon if provided
  IF p_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon FROM public.coupons
    -- FIX BUG 1: normalise to upper() so it matches validate_coupon behaviour
    WHERE code = upper(p_coupon_code) AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (usage_limit IS NULL OR used_count < usage_limit);
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', p_coupon_code;
    END IF;
  END IF;

  -- FIX BUG 2: discount calculation is now flat in the outer block (no nested DECLARE)
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

  -- Insert each item and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_qty := (v_item->>'quantity')::INTEGER;

    SELECT id, price, discount_price, stock
      INTO v_product
      FROM public.products
     WHERE id = (v_item->>'product_id')::UUID AND is_active = true;

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

  -- Notify buyer
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
$$;
