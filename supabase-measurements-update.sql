-- CK STYLE: Measurement System Schema Update
-- Run this in the Supabase SQL Editor to prepare the database.

-- 1. Backup existing data (optional, only if you have real data)
-- create table measurements_backup as select * from measurements;

-- 2. Drop the old restrictive table
drop table if exists public.measurements cascade;

-- 3. Create the new flexible table
create table public.measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Profile Information
  profile_name text not null,
  sex text check (sex in ('male', 'female', 'other')),
  unit text check (unit in ('cm', 'inch')),
  
  -- Flexible JSON B storage for all measurement values (chest, waist, etc.)
  -- Structure: { "chest": 100, "waist": 85, "shoulder": 45, ... }
  data jsonb not null default '{}'::jsonb,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.measurements enable row level security;

-- 5. Create Policies (CRUD)

-- View: Users can view their own measurements
create policy "Users can view own measurements" 
on public.measurements for select 
using (auth.uid() = user_id);

-- Insert: Users can insert their own measurements
create policy "Users can insert own measurements" 
on public.measurements for insert 
with check (auth.uid() = user_id);

-- Update: Users can update their own measurements
create policy "Users can update own measurements" 
on public.measurements for update 
using (auth.uid() = user_id);

-- Delete: Users can delete their own measurements
create policy "Users can delete own measurements" 
on public.measurements for delete 
using (auth.uid() = user_id);

-- 6. Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_measurements_updated
  before update on public.measurements
  for each row execute function public.handle_updated_at();

-- 7. (Optional) Create an index on specific json fields if we query them often
-- create index measurements_chest_idx on public.measurements ((data->>'chest'));
