-- Debug script to check RBAC database status
-- Run this in Supabase SQL Editor to diagnose role creation issues

-- 1. Check if tables exist
SELECT 'Table exists: ' || table_name as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'permissions', 'user_roles', 'role_permissions')
ORDER BY table_name;

-- 2. Check RLS status on roles table
SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'roles';

-- 3. Check existing roles
SELECT 'Existing roles:' as info;
SELECT id, name, display_name, description, is_system_role, is_active, created_at
FROM public.roles
ORDER BY created_at DESC;

-- 4. Check existing permissions
SELECT 'Existing permissions:' as info;
SELECT id, name, display_name, description, sort_order
FROM public.permissions
ORDER BY sort_order;

-- 5. Check role_permissions relationships
SELECT 'Role-Permission relationships:' as info;
SELECT rp.id, r.name as role_name, p.name as permission_name
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
JOIN public.permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;

-- 6. Check if functions exist
SELECT 'Functions:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%role%' OR routine_name LIKE '%permission%'
ORDER BY routine_name;

-- 7. Check current user permissions (if any)
SELECT 'Current user info:' as info;
SELECT auth.uid() as current_user_id, auth.role() as current_role;

-- 8. Test role creation permissions
SELECT 'Testing role creation access:' as info;
-- This will show if you can insert into roles table
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_privileges 
            WHERE grantee = 'authenticated' 
            AND table_name = 'roles' 
            AND privilege_type = 'INSERT'
        ) THEN 'INSERT privilege granted to authenticated users'
        ELSE 'No INSERT privilege for authenticated users'
    END as role_insert_status;
