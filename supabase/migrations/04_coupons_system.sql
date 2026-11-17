-- ============================================================
-- SAC SHOP - Coupons & Discounts System
-- Phase 1: Database Schema + RLS
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Coupons Table
-- scope: 'store' = applies to whole store, 'products' = only products listed in coupon_products
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    -- percentage coupons cannot exceed 100%
    CONSTRAINT coupons_percentage_max_100 CHECK (
        discount_type <> 'percentage' OR discount_value <= 100
    ),
    min_order_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    -- optional cap on the discount amount (useful for percentage coupons)
    max_discount_amount DECIMAL(10, 2),
    scope TEXT NOT NULL DEFAULT 'store' CHECK (scope IN ('store', 'products')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
    uses_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Coupon <-> Products link table (empty = store-wide coupon)
CREATE TABLE IF NOT EXISTS public.coupon_products (
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    PRIMARY KEY (coupon_id, product_id)
);

-- 3. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_upper_idx ON public.coupons (UPPER(code));
CREATE INDEX IF NOT EXISTS coupon_products_product_idx ON public.coupon_products (product_id);
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON public.coupons (is_active) WHERE is_active = TRUE;

-- 4. Normalize codes to uppercase on write
CREATE OR REPLACE FUNCTION public.normalize_coupon_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.code = UPPER(BTRIM(NEW.code));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coupons_normalize_code ON public.coupons;
CREATE TRIGGER coupons_normalize_code
    BEFORE INSERT OR UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.normalize_coupon_code();

-- 5. Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coupons_touch_updated_at ON public.coupons;
CREATE TRIGGER coupons_touch_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Atomic redemption: increments uses_count only if the coupon
-- is still redeemable. Returns true when the use was recorded.
-- Called server-side (service role) after a successful order.
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_coupon_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE public.coupons
       SET uses_count = uses_count + 1
     WHERE id = p_coupon_id
       AND is_active = TRUE
       AND starts_at <= NOW()
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR uses_count < max_uses);

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- 7. Row Level Security
-- Coupons must NOT be publicly readable: public SELECT would let
-- anyone enumerate valid codes. Validation happens exclusively
-- through server-side API routes using the service role key
-- (same pattern as vip_offers admin CRUD), which bypasses RLS.
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_products ENABLE ROW LEVEL SECURITY;

-- Intentionally NO public policies on coupons / coupon_products.
-- Admin dashboard and coupon validation go through the service role.

-- 8. Orders integration: persist what was applied to each order
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'coupon_code'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE public.orders
            ADD COLUMN discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;
