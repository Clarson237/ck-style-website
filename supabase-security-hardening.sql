-- =====================================================
-- CK STYLE: Unified Security Hardening Script
-- =====================================================
-- 🛡️ Purpose:
-- 1. Unify Admin/Super Admin checks via Security Definer functions (recursion-safe).
-- 2. Fix malformed Storage policies for the 'collections' bucket.
-- 3. Ensure consistent RLS across all tables.
-- 4. Secure the Admin Audit Log.
-- =====================================================

-- 1. UTILITY FUNCTIONS (Security Definer to break RLS recursion)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

-- 2. TABLE SECURITY (Ensure RLS is ON)
-- =====================================================
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.measurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_leads ENABLE ROW LEVEL SECURITY;

-- 3. CONSOLIDATED PUBLIC POLICIES (Read-Only)
-- =====================================================

-- Collections: Anyone can view published items
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
CREATE POLICY "Public can view published collections" ON public.collections
  FOR SELECT USING (visibility = 'published');

-- Collection Images: Anyone can view images
DROP POLICY IF EXISTS "Allow public read-only access to images" ON public.collection_images;
CREATE POLICY "Allow public read-only access to images" ON public.collection_images
  FOR SELECT USING (true);

-- Leads: Anyone can report a lead
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.whatsapp_leads;
CREATE POLICY "Anyone can insert leads" ON public.whatsapp_leads
  FOR INSERT WITH CHECK (true);

-- Audit Logs: Allow everyone to report security events (unauthorized attempts)
DROP POLICY IF EXISTS "Enable security reporting" ON public.admin_audit_logs;
CREATE POLICY "Enable security reporting" ON public.admin_audit_logs 
  FOR INSERT WITH CHECK (true);

-- 4. CONSOLIDATED ADMIN POLICIES (Full Access)
-- =====================================================

-- Collections
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL USING (public.is_admin());

-- Collection Images
DROP POLICY IF EXISTS "Super admins can manage collection images" ON public.collection_images;
DROP POLICY IF EXISTS "Admins can manage images" ON public.collection_images;
CREATE POLICY "Admins can manage images" ON public.collection_images
  FOR ALL USING (public.is_admin());

-- Profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Measurements
DROP POLICY IF EXISTS "Admins view all measurements" ON public.measurements;
CREATE POLICY "Admins view all measurements" ON public.measurements
  FOR SELECT USING (public.is_admin());

-- Measurement Items
DROP POLICY IF EXISTS "Admins view all measurement items" ON public.measurement_items;
CREATE POLICY "Admins view all measurement items" ON public.measurement_items
  FOR SELECT USING (public.is_admin());

-- WhatsApp Leads
DROP POLICY IF EXISTS "Admins can view leads" ON public.whatsapp_leads;
CREATE POLICY "Admins can view leads" ON public.whatsapp_leads
  FOR SELECT USING (public.is_admin());

-- Audit Logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (public.is_admin());

-- User Roles
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin());

-- 5. STORAGE SECURITY (Bucket: collections)
-- =====================================================

-- Allow public to see product images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'collections');

-- Strictly allow only Admins to manage collections bucket files
DROP POLICY IF EXISTS "Admins can manage collections images" ON storage.objects;
CREATE POLICY "Admins can manage collections images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'collections' AND 
    (SELECT public.is_admin())
  );

-- =====================================================
-- 🛡️ HARDENING COMPLETE
-- =====================================================
