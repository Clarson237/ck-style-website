-- CK STYLE: Admin Security & Collections (REFINED & ROBUST)
-- Run this in your Supabase SQL Editor.

-- SECTION 1: TABLES CREATION (Creates everything first to avoid dependency errors)

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  price_fcfa NUMERIC,
  visibility TEXT DEFAULT 'published' CHECK (visibility IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [NEW] 2b. Collection Images Table (Multi-Image Support)
CREATE TABLE IF NOT EXISTS public.collection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.collection_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to images" ON public.collection_images
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage collection images" ON public.collection_images
  FOR ALL USING (public.is_super_admin());

-- 3. Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 2: ADMIN ASSIGNMENT

-- Assign your specific User ID as Super Admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('5904d707-8281-47b3-b9d1-291c43ece212', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- SECTION 3: SECURITY FUNCTIONS (Breaks RLS recursion)
-- The SET search_path is critical to prevent recursion and security leaks
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- SECTION 4: ROW LEVEL SECURITY (Enable RLS AFTER tables exist)

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- SECTION 5: POLICIES

-- [user_roles] Users can ALWAYS see their own role. (Simplest check, no recursion)
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- [user_roles] Use Function for management (Breaks recursion)
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin());

-- [collections] Public can only see published collections
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
CREATE POLICY "Public can view published collections" ON public.collections
  FOR SELECT USING (visibility = 'published');

-- [collections] Use Function (Breaks recursion)
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL USING (public.is_super_admin());

-- [admin_audit_logs] Use Function (Breaks recursion)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (public.is_super_admin());

-- [admin_audit_logs] Allow anyone to report security events (Breaches/Unauthorized attempts)
DROP POLICY IF EXISTS "Enable security reporting" ON public.admin_audit_logs;
CREATE POLICY "Enable security reporting" ON public.admin_audit_logs 
  FOR INSERT WITH CHECK (true);

-- SECTION 5: AUTOMATION & INDEXES

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_collections_updated ON public.collections;
CREATE TRIGGER on_collections_updated
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_collections_visibility ON public.collections(visibility);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at);

-- SECTION 6: STORAGE SETUP
-- This creates the collections bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('collections', 'collections', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'collections');

-- Allow admins to upload/manage images
  (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'))
);

-- Grants
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.collection_images TO authenticated;
GRANT ALL ON public.admin_audit_logs TO authenticated;
GRANT SELECT ON public.collection_images TO anon;
GRANT SELECT ON public.collections TO anon;
