-- ============================================================
-- ARKA Supabase Schema
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  city                TEXT,
  delivery_zone           TEXT,
  platform                TEXT CHECK (platform IN ('zepto','blinkit','swiggy','zomato','dunzo','other')),
  avg_weekly_income       NUMERIC(10,2),
  avg_weekly_hours        NUMERIC(5,1),
  avg_weekly_deliveries   INTEGER,
  upi_id                  TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  policy_status       TEXT DEFAULT 'pending' CHECK (policy_status IN ('pending','active','inactive','rejected')),
  risk_score          NUMERIC(5,2),
  premium_tier        NUMERIC(3,1),   -- 1.0, 2.0, or 3.0 (%)
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/write their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
