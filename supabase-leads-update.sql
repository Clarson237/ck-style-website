-- Add status column to whatsapp_leads for management
alter table public.whatsapp_leads 
add column if not exists status text default 'pending';

-- Update RLS for update (admins only)
create policy "Admins can update leads"
on public.whatsapp_leads for update
using (
    exists (
        select 1 from public.user_roles
        where user_roles.user_id = auth.uid()
        and user_roles.role in ('admin', 'super_admin')
    )
);
