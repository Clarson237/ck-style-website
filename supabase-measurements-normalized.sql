-- CK STYLE: Normalized Measurement System (Admin + AI Ready)
-- Run this in Supabase SQL Editor to create the measurement system

-- =====================================================
-- 1. BACKUP EXISTING DATA (if any)
-- =====================================================
-- Uncomment if you have existing data:
-- CREATE TABLE measurements_backup AS SELECT * FROM public.measurements;

-- =====================================================
-- 2. DROP OLD TABLES (Clean slate)
-- =====================================================
DROP TABLE IF EXISTS public.measurement_items CASCADE;
DROP TABLE IF EXISTS public.measurements CASCADE;

-- =====================================================
-- 3. CREATE MEASUREMENTS TABLE (Session Level)
-- =====================================================
CREATE TABLE public.measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- User-entered metadata
  profile_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  unit TEXT NOT NULL CHECK (unit IN ('cm', 'inch')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 4. CREATE MEASUREMENT_ITEMS TABLE (Individual Measurements)
-- =====================================================
CREATE TABLE public.measurement_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  measurement_id UUID REFERENCES public.measurements(id) ON DELETE CASCADE NOT NULL,
  
  -- Structured measurement data
  category TEXT NOT NULL CHECK (category IN ('top', 'gown', 'trousers')),
  measurement_key TEXT NOT NULL, -- e.g. 'hand_length', 'chest', 'waist'
  measurement_value NUMERIC(6, 2) NOT NULL, -- e.g. 42.5
  
  -- Optional: Store display name for flexibility
  display_name TEXT, -- e.g. 'Hand Length', 'Chest'
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 5. INDEXES (Performance for admin queries)
-- =====================================================
CREATE INDEX idx_measurements_user_id ON public.measurements(user_id);
CREATE INDEX idx_measurements_sex ON public.measurements(sex);
CREATE INDEX idx_measurements_created_at ON public.measurements(created_at DESC);

CREATE INDEX idx_measurement_items_measurement_id ON public.measurement_items(measurement_id);
CREATE INDEX idx_measurement_items_category ON public.measurement_items(category);
CREATE INDEX idx_measurement_items_key ON public.measurement_items(measurement_key);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own measurements
CREATE POLICY "Users view own measurements"
ON public.measurements FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own measurements
CREATE POLICY "Users insert own measurements"
ON public.measurements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own measurements
CREATE POLICY "Users update own measurements"
ON public.measurements FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own measurements
CREATE POLICY "Users delete own measurements"
ON public.measurements FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- MEASUREMENT ITEMS POLICIES
-- =====================================================

-- Users can view items for their own measurements
CREATE POLICY "Users view own measurement items"
ON public.measurement_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.measurements
    WHERE measurements.id = measurement_items.measurement_id
    AND measurements.user_id = auth.uid()
  )
);

-- Users can insert items for their own measurements
CREATE POLICY "Users insert own measurement items"
ON public.measurement_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.measurements
    WHERE measurements.id = measurement_items.measurement_id
    AND measurements.user_id = auth.uid()
  )
);

-- Users can update items for their own measurements
CREATE POLICY "Users update own measurement items"
ON public.measurement_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.measurements
    WHERE measurements.id = measurement_items.measurement_id
    AND measurements.user_id = auth.uid()
  )
);

-- Users can delete items for their own measurements
CREATE POLICY "Users delete own measurement items"
ON public.measurement_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.measurements
    WHERE measurements.id = measurement_items.measurement_id
    AND measurements.user_id = auth.uid()
  )
);

-- =====================================================
-- ADMIN POLICIES (Read-Only Access to All Measurements)
-- =====================================================

-- Admins can view ALL measurements
CREATE POLICY "Admins view all measurements"
ON public.measurements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Admins can view ALL measurement items
CREATE POLICY "Admins view all measurement items"
ON public.measurement_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- 7. AUTO-UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_measurements_updated
  BEFORE UPDATE ON public.measurements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 8. HELPFUL ADMIN VIEWS (Optional but recommended)
-- =====================================================

-- View: All measurements with user email
CREATE OR REPLACE VIEW public.admin_measurements_view AS
SELECT 
  m.id,
  m.user_id,
  au.email AS user_email,
  m.profile_name,
  m.full_name,
  m.sex,
  m.unit,
  m.created_at,
  m.updated_at,
  COUNT(mi.id) AS total_measurements
FROM public.measurements m
LEFT JOIN auth.users au ON m.user_id = au.id
LEFT JOIN public.measurement_items mi ON m.id = mi.measurement_id
GROUP BY m.id, au.email;

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Next steps:
-- 1. Update measure-wizard.js to use this normalized structure
-- 2. Create admin export functionality
-- 3. Test RLS policies
