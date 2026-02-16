-- CK STYLE: WhatsApp Leads Tracking
-- Tracks clicks on "Buy via WA" buttons

-- 1. Leads Table
create table if not exists public.whatsapp_leads (
    id uuid default gen_random_uuid() primary key,
    product_title text not null,
    product_price text,
    product_url text,
    user_id uuid references auth.users(id), -- Optional, if user is logged in
    user_agent text,
    ip_address text, -- RLS should filter this out for privacy if needed, but useful for abuse check
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS Policies
alter table public.whatsapp_leads enable row level security;

-- Allow ANYONE (including anon) to insert leads
create policy "Anyone can insert leads"
on public.whatsapp_leads for insert
with check (true);

-- Allow Admins to View Leads
create policy "Admins can view leads"
on public.whatsapp_leads for select
using (
    exists (
        select 1 from public.user_roles
        where user_roles.user_id = auth.uid()
        and user_roles.role in ('admin', 'super_admin')
    )
);
