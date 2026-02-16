-- Add theme column to profiles for theme persistence
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' 
CHECK (theme IN ('light', 'dark'));

-- Ensure it's visible in public profiles if needed, 
-- but RLS usually handles this.
-- Re-confirming RLS for profiles if needed:
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
-- CREATE POLICY "Users can update own profile" 
-- ON public.profiles FOR UPDATE 
-- USING (auth.uid() = id);
