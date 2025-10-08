-- Fix RLS policies for role_permissions table to allow proper access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "role_permissions_select_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_insert_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_update_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_delete_policy" ON public.role_permissions;

-- Create more permissive RLS policies for role_permissions
-- Allow authenticated users to read role permissions
CREATE POLICY "role_permissions_select_policy" ON public.role_permissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert role permissions
-- This is needed for role management functionality
CREATE POLICY "role_permissions_insert_policy" ON public.role_permissions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update role permissions
CREATE POLICY "role_permissions_update_policy" ON public.role_permissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete role permissions
CREATE POLICY "role_permissions_delete_policy" ON public.role_permissions
    FOR DELETE
    TO authenticated
    USING (true);

-- Also ensure the permissions table has proper RLS policies
DROP POLICY IF EXISTS "permissions_select_policy" ON public.permissions;
CREATE POLICY "permissions_select_policy" ON public.permissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Check if RLS is enabled on role_permissions table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('role_permissions', 'permissions');

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('role_permissions', 'permissions')
ORDER BY tablename, policyname;
