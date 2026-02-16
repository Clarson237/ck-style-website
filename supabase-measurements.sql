-- CK STYLE: measurements table and RLS (run this in Supabase SQL Editor)

-- Table for user measurements (id = generated, user_id = auth.users.id)
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  height numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  shoulder numeric,
  sleeve numeric,
  inseam numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Ensure one row per user
  unique(user_id)
);

-- RLS: users can only read/update/insert their own measurements
alter table public.measurements enable row level security;

-- SELECT policy
drop policy if exists "Users can view own measurements" on public.measurements;
create policy "Users can view own measurements" on public.measurements
  for select using (auth.uid() = user_id);

-- INSERT policy
drop policy if exists "Users can insert own measurements" on public.measurements;
create policy "Users can insert own measurements" on public.measurements
  for insert with check (auth.uid() = user_id);

-- UPDATE policy
drop policy if exists "Users can update own measurements" on public.measurements;
create policy "Users can update own measurements" on public.measurements
  for update using (auth.uid() = user_id);

-- Trigger to update updated_at on changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_measurements_updated on public.measurements;
create trigger on_measurements_updated
  before update on public.measurements
  for each row execute function public.handle_updated_at();
