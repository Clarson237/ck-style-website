-- CK STYLE: Admin Profiles Access
-- Run this in Supabase SQL Editor if admins cannot see user emails

-- 1. Enable RLS on profiles if not already
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow Admins to View All Profiles
-- This ensures the admin/measurements.html dashboard can fetch emails
CREATE POLICY "Admins view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);
