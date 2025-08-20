-- Complete setup script for permissions and RLS policies
-- Run this in Supabase SQL Editor to populate permissions and fix RLS

-- First, populate permissions table with module-action combinations
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id as module_id,
    a.id as action_id,
    CONCAT(m.name, ':', a.name) as permission_key,
    CONCAT(a.display_name, ' ', m.display_name) as display_name,
    CONCAT(a.description, ' for ', m.display_name) as description
FROM public.modules m
CROSS JOIN public.actions a
WHERE m.is_active = TRUE AND a.is_active = TRUE
ON CONFLICT (permission_key) DO NOTHING;

-- Fix RLS policies for role_permissions table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "role_permissions_select_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_insert_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_update_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_delete_policy" ON public.role_permissions;

-- Create permissive RLS policies for authenticated users
CREATE POLICY "role_permissions_select_policy" ON public.role_permissions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "role_permissions_insert_policy" ON public.role_permissions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "role_permissions_update_policy" ON public.role_permissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "role_permissions_delete_policy" ON public.role_permissions
    FOR DELETE
    TO authenticated
    USING (true);

-- Ensure permissions table has proper RLS policies
DROP POLICY IF EXISTS "permissions_select_policy" ON public.permissions;
CREATE POLICY "permissions_select_policy" ON public.permissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Grant all permissions to admin role if it exists
DO $$
DECLARE
    admin_role_id bigint;
    perm_record RECORD;
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin' LIMIT 1;
    
    IF admin_role_id IS NOT NULL THEN
        -- Grant all permissions to admin role
        FOR perm_record IN SELECT id FROM public.permissions WHERE is_active = TRUE
        LOOP
            INSERT INTO public.role_permissions (role_id, permission_id)
            VALUES (admin_role_id, perm_record.id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Granted permissions to admin role (ID: %)', admin_role_id;
    ELSE
        RAISE NOTICE 'Admin role not found';
    END IF;
END $$;

-- Show summary of what was created
SELECT 
    'Permissions' as table_name,
    COUNT(*) as total_rows
FROM public.permissions
WHERE is_active = TRUE

UNION ALL

SELECT 
    'Role Permissions (Admin)' as table_name,
    COUNT(*) as total_rows
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
WHERE r.name = 'admin';

-- Show sample permissions for verification
SELECT 
    p.permission_key,
    p.display_name,
    m.display_name as module_name,
    a.display_name as action_name
FROM public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE p.is_active = TRUE
ORDER BY m.sort_order, a.sort_order
LIMIT 10;
