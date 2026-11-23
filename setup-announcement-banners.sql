-- =========================================================================
-- VTAB SQUARE - ANNOUNCEMENT BANNERS SETUP SCRIPT
-- Run in Supabase SQL Editor (Project: wclpchjxdglhinoazxmr)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.announcement_banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT,
  badge_text TEXT NOT NULL DEFAULT 'New Application',
  headline_prefix TEXT NOT NULL DEFAULT 'Meet',
  headline_highlight TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Explore Reporting Tool',
  cta_mobile_text TEXT NOT NULL DEFAULT 'Explore',
  background_image TEXT,
  theme_preset TEXT DEFAULT 'cyan-purple',
  bg_gradient TEXT,
  highlight_gradient TEXT,
  cta_gradient TEXT,
  cta_shadow TEXT,
  badge_border_class TEXT,
  badge_bg_class TEXT,
  badge_pulse_color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.announcement_banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for company website visitors)
DROP POLICY IF EXISTS "Public read access on announcement_banners" ON public.announcement_banners;
CREATE POLICY "Public read access on announcement_banners" 
  ON public.announcement_banners 
  FOR SELECT 
  USING (true);

-- Allow authenticated and admin anon access (for Admin Dashboard CRUD)
DROP POLICY IF EXISTS "Full access on announcement_banners" ON public.announcement_banners;
CREATE POLICY "Full access on announcement_banners" 
  ON public.announcement_banners 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
