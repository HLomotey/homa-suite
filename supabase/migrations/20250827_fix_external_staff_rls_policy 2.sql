-- Fix RLS policy for external_staff table to allow inserts
-- This addresses the 403 Forbidden error when trying to insert new staff records

-- Drop existing restrictive policies if they exist
drop policy if exists "Users can insert external_staff records" on public.external_staff;
drop policy if exists "Users can view external_staff records" on public.external_staff;
drop policy if exists "Users can update external_staff records" on public.external_staff;
drop policy if exists "Users can delete external_staff records" on public.external_staff;

-- Create a single permissive policy for all operations on external_staff
create policy "Allow all operations on external_staff" on public.external_staff
  for all using (auth.role() = 'authenticated');
