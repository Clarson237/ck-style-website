-- CK STYLE: Notifications System
-- Run this in Supabase SQL Editor

-- 1. Notifications Table
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text default 'Notification',
    message text not null,
    type text default 'info' check (type in ('info', 'success', 'warning', 'danger')),
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS Policies
alter table public.notifications enable row level security;

-- Users can read their own notifications
create policy "Users can view own notifications"
on public.notifications for select
using (auth.uid() = user_id);

-- Users can update their own notifications (to mark as read)
create policy "Users can update own notifications"
on public.notifications for update
using (auth.uid() = user_id);

-- Admins can manage all notifications
create policy "Admins can manage notifications"
on public.notifications for all
using (
    exists (
        select 1 from public.user_roles
        where user_roles.user_id = auth.uid()
        and user_roles.role in ('admin', 'super_admin')
    )
);

-- 3. Index for performance
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
