-- Complete admin setup for nanasefa@gmail.com
-- This script combines permissions setup + admin role assignment
-- Run this in Supabase SQL Editor

-- PART 1: Setup permissions and RLS (from setup-permissions-and-rls.sql)
-- Populate permissions table with module-action combinations
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
DROP POLICY IF EXISTS "role_permissions_select_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_insert_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_update_policy" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_delete_policy" ON public.role_permissions;

CREATE POLICY "role_permissions_select_policy" ON public.role_permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_insert_policy" ON public.role_permissions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "role_permissions_update_policy" ON public.role_permissions
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "role_permissions_delete_policy" ON public.role_permissions
    FOR DELETE TO authenticated USING (true);

-- Fix RLS policies for permissions table
DROP POLICY IF EXISTS "permissions_select_policy" ON public.permissions;
CREATE POLICY "permissions_select_policy" ON public.permissions
    FOR SELECT TO authenticated USING (true);

-- PART 2: Admin role assignment
-- Ensure admin role exists
INSERT INTO public.roles (name, display_name, description, is_system_role, is_active, sort_order)
VALUES ('admin', 'Administrator', 'Full system administrator with all permissions', true, true, 1)
ON CONFLICT (name) DO NOTHING;

-- Assign admin role to nanasefa@gmail.com
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
    u.id as user_id,
    r.id as role_id
FROM auth.users u
CROSS JOIN public.roles r
WHERE u.email = 'nanasefa@gmail.com' 
AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Grant all permissions to admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin' 
AND p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- VERIFICATION QUERIES
SELECT '=== VERIFICATION RESULTS ===' as section;

SELECT 'User Found:' as check_type, email, id as user_id
FROM auth.users 
WHERE email = 'nanasefa@gmail.com';

SELECT 'Admin Role:' as check_type, name, display_name, id as role_id
FROM public.roles 
WHERE name = 'admin';

SELECT 'Role Assignment:' as check_type, u.email, r.name as role_name
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'nanasefa@gmail.com';

SELECT 'Permissions Count:' as check_type, 
       COUNT(*) as total_permissions,
       COUNT(CASE WHEN is_active = true THEN 1 END) as active_permissions
FROM public.permissions;

SELECT 'Admin Role Permissions:' as check_type,
       COUNT(*) as permissions_assigned_to_admin
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
WHERE r.name = 'admin';

-- Test effective permissions function
SELECT 'Effective Permissions Sample:' as check_type, permission_key
FROM get_user_effective_permissions(
    (SELECT id FROM auth.users WHERE email = 'nanasefa@gmail.com')
)
ORDER BY permission_key
LIMIT 5;
