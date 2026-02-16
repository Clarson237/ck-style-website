-- Super Admin & Audit Setup
-- Run this in Supabase SQL Editor

-- 1. User Roles Table
create table if not exists public.user_roles (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('admin', 'super_admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 2. Audit Logs Table
create table if not exists public.admin_audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  resource text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS Policies
alter table public.user_roles enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Allow users to read their own role
create policy "Users can read own role" on public.user_roles
  for select using (auth.uid() = user_id);

-- Allow admins to read all roles
create policy "Admins can read all roles" on public.user_roles
  for select using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Allow admins to insert audit logs
create policy "Admins can insert logs" on public.admin_audit_logs
  for insert with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Allow admins to view audit logs
create policy "Admins can view logs" on public.admin_audit_logs
  for select using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- 4. Initial Super Admin (Replace EMAIL with your email)
-- insert into public.user_roles (id, user_id, role)
-- select id, id, 'super_admin' from auth.users where email = 'YOUR_EMAIL@HERE.COM'
-- on conflict (user_id) do update set role = 'super_admin';
