-- Fix RLS policies for roles table to ensure proper read access
-- This migration ensures roles can be read by authenticated users

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.roles;
DROP POLICY IF EXISTS "Allow service role full access to roles" ON public.roles;
DROP POLICY IF EXISTS "Allow admin users to manage roles" ON public.roles;

-- Create comprehensive RLS policies for roles table
-- Allow service role (used by admin client) full access
CREATE POLICY "service_role_full_access_roles" ON public.roles
    FOR ALL USING (auth.role() = 'service_role');

-- Allow all authenticated users to read roles (needed for UI dropdowns)
CREATE POLICY "authenticated_users_read_roles" ON public.roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow admin users to manage roles
CREATE POLICY "admin_users_manage_roles" ON public.roles
    FOR ALL USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (
                raw_user_meta_data->>'role' = 'admin' 
                OR user_metadata->>'role' = 'admin'
                OR role = 'admin'
            )
        )
    );

-- Ensure the roles table has RLS enabled
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- No predefined roles - roles will be created dynamically through the UI
