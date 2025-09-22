-- Fix RLS policies for roles table to prevent circular dependency
-- This migration fixes the issue where role creation fails due to circular dependency
-- in the permission checking system

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow admins full access to roles" ON public.roles;
DROP POLICY IF EXISTS "Allow read access to roles" ON public.roles;

-- Create new policies that don't rely on the permission system for basic role operations
-- Allow service role (admin client) to have full access
CREATE POLICY "Allow service role full access to roles" ON public.roles
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users with admin role in auth.users table to manage roles
CREATE POLICY "Allow admin users to manage roles" ON public.roles
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

-- Allow all authenticated users to read roles (needed for dropdowns and UI)
CREATE POLICY "Allow authenticated users to read roles" ON public.roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Also fix similar issues with other tables that might have circular dependencies
-- Fix modules table policies
DROP POLICY IF EXISTS "Allow admins full access to modules" ON public.modules;
DROP POLICY IF EXISTS "Allow read access to modules" ON public.modules;

CREATE POLICY "Allow service role full access to modules" ON public.modules
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin users to manage modules" ON public.modules
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

CREATE POLICY "Allow authenticated users to read modules" ON public.modules
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix actions table policies
DROP POLICY IF EXISTS "Allow admins full access to actions" ON public.actions;
DROP POLICY IF EXISTS "Allow read access to actions" ON public.actions;

CREATE POLICY "Allow service role full access to actions" ON public.actions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin users to manage actions" ON public.actions
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

CREATE POLICY "Allow authenticated users to read actions" ON public.actions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix permissions table policies
DROP POLICY IF EXISTS "Allow admins full access to permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow read access to permissions" ON public.permissions;

CREATE POLICY "Allow service role full access to permissions" ON public.permissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin users to manage permissions" ON public.permissions
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

CREATE POLICY "Allow authenticated users to read permissions" ON public.permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix role_permissions table policies
DROP POLICY IF EXISTS "Allow admins full access to role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Allow read access to role_permissions" ON public.role_permissions;

CREATE POLICY "Allow service role full access to role_permissions" ON public.role_permissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin users to manage role_permissions" ON public.role_permissions
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

CREATE POLICY "Allow authenticated users to read role_permissions" ON public.role_permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix user_roles table policies
DROP POLICY IF EXISTS "Allow admins full access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to see their own roles" ON public.user_roles;

CREATE POLICY "Allow service role full access to user_roles" ON public.user_roles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin users to manage user_roles" ON public.user_roles
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

CREATE POLICY "Allow users to see their own roles" ON public.user_roles
    FOR SELECT USING (
        auth.uid() = user_id OR 
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

-- Fix user_permissions table policies
DROP POLICY IF EXISTS "Allow admins full access to user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Allow users to see their own permissions" ON public.user_permissions;

CREATE POLICY "Allow service role full access to user_permissions" ON public.user_permissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow admin users to manage user_permissions" ON public.user_permissions
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

CREATE POLICY "Allow users to see their own permissions" ON public.user_permissions
    FOR SELECT USING (
        auth.uid() = user_id OR 
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
