-- ============================================================
-- Short Links Table for Facebook Ad Campaigns
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.short_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,          -- e.g. "p-abc123"
  product_id    UUID NOT NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT,                          -- product image URL for landing page
  destination   TEXT NOT NULL,                 -- full product URL
  clicks        INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast slug lookup (used on every redirect)
CREATE UNIQUE INDEX IF NOT EXISTS short_links_slug_idx ON public.short_links(slug);

-- Row Level Security: public read (for redirects), admin full access via service role
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (needed for redirect API route which uses anon key)
CREATE POLICY "public_read_short_links"
  ON public.short_links
  FOR SELECT
  USING (true);

-- Allow service role (admin API) to do everything
-- (service role bypasses RLS by default in Supabase)

-- ============================================================
-- MIGRATION: Add product_image column (run if table already exists)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'short_links' AND column_name = 'product_image'
  ) THEN
    ALTER TABLE public.short_links ADD COLUMN product_image TEXT;
  END IF;
END $$;

-- ============================================================
-- MIGRATION: Add type column for product vs category links
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'short_links' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.short_links ADD COLUMN type TEXT NOT NULL DEFAULT 'product';
  END IF;
END $$;
