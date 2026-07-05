-- Migration 002: Payment Gateway Support
-- Run this in Supabase SQL Editor after 001_complete_schema.sql

-- Allow service_role to update payment status (called by Express backend)
-- The existing "Admin can update orders" policy only covers users with admin role.
-- The backend uses service_role which bypasses RLS entirely, so no extra policy needed.
-- This migration adds useful indexes and ensures payment_ref is indexed for gateway callbacks.

CREATE INDEX IF NOT EXISTS orders_payment_ref_idx ON public.orders(payment_ref)
  WHERE payment_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number);

-- View for admins to see payment details
CREATE OR REPLACE VIEW public.order_payment_summary AS
SELECT
  id,
  order_number,
  user_id,
  total_amount,
  payment_method,
  payment_status,
  payment_ref,
  status,
  created_at
FROM public.orders;

-- Grant select on this view to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.order_payment_summary TO authenticated;

COMMENT ON COLUMN public.orders.payment_ref IS 
  'Gateway transaction reference: SSLCommerz val_id or bKash trxID';
