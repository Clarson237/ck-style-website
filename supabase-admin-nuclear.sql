-- NUCLEAR RESET (RECURSION-PROOF)
-- This will wipe and recreate all admin tables with security rules that CANNOT loop.

-- 1. CLEANUP
DROP TABLE IF EXISTS public.admin_audit_logs;
DROP TABLE IF EXISTS public.collection_images;
DROP TABLE IF EXISTS public.collections;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin CASCADE;

-- 2. RECURSION-PROOF FUNCTION (Defined early to avoid dependency errors)
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

-- 3. CREATE TABLES
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.collections (
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

CREATE TABLE public.collection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ASSIGN YOUR ADMIN ROLE (Run as postgres)
INSERT INTO public.user_roles (user_id, role)
VALUES ('5904d707-8281-47b3-b9d1-291c43ece212', 'super_admin');

-- 5. ENABLE RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. NON-RECURSIVE POLICIES

-- [user_roles] Only a simple SELECT so it DOES NOT loop
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles 
  FOR SELECT USING (auth.uid() = user_id);

-- [collections] Public can see published
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
CREATE POLICY "Public can view published collections" ON public.collections 
  FOR SELECT USING (visibility = 'published');

-- [collections] Admins can manage
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" ON public.collections 
  FOR ALL USING (public.is_super_admin());

-- [collection_images] Multi-Image access
DROP POLICY IF EXISTS "Public Read Images" ON public.collection_images;
CREATE POLICY "Public Read Images" ON public.collection_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Images" ON public.collection_images;
CREATE POLICY "Admin Manage Images" ON public.collection_images FOR ALL USING (public.is_super_admin());

-- [admin_audit_logs] Admins can view
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs 
  FOR SELECT USING (public.is_super_admin());

-- [admin_audit_logs] Allow anyone to report security events
DROP POLICY IF EXISTS "Enable security reporting" ON public.admin_audit_logs;
CREATE POLICY "Enable security reporting" ON public.admin_audit_logs 
  FOR INSERT WITH CHECK (true);

-- 7. PERMISSIONS
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.collection_images TO authenticated;
GRANT ALL ON public.admin_audit_logs TO authenticated;
GRANT SELECT ON public.collection_images TO anon;
GRANT SELECT ON public.collections TO anon;

-- 8. STORAGE SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES ('collections', 'collections', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'collections');

DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'collections' AND (public.is_super_admin())
);
