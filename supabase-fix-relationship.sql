-- CK STYLE: Fix Profile-Role Relationship
-- Run this in Supabase SQL Editor if you prefer to use JOINS in the future.
-- This formally links the 'user_roles' and 'profiles' tables.

ALTER TABLE IF EXISTS public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_profile_id_fkey;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_profile_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;
