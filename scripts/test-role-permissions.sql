-- Test script to verify role permissions are working correctly
-- Run this in Supabase SQL Editor to check permission assignments

-- 1. Check existing roles
SELECT 'Current roles:' as info;
SELECT id, name, display_name, description, created_at
FROM public.roles
ORDER BY created_at DESC;

-- 2. Check existing permissions
SELECT 'Available permissions:' as info;
SELECT id, name, display_name, description
FROM public.permissions
ORDER BY sort_order;

-- 3. Check role-permission assignments
SELECT 'Role-Permission assignments:' as info;
SELECT 
    rp.role_id,
    r.name as role_name,
    rp.permission_id,
    p.name as permission_name,
    p.display_name as permission_display_name
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
JOIN public.permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;

-- 4. Count permissions per role
SELECT 'Permission counts per role:' as info;
SELECT 
    r.id,
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM public.roles r
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

-- 5. Test inserting a permission for test_role if it exists
DO $$
DECLARE
    test_role_id BIGINT;
    read_permission_id BIGINT;
BEGIN
    -- Get test_role ID
    SELECT id INTO test_role_id FROM public.roles WHERE name = 'test_role';
    
    -- Get read permission ID
    SELECT id INTO read_permission_id FROM public.permissions WHERE name = 'read';
    
    -- Insert permission if both exist and not already assigned
    IF test_role_id IS NOT NULL AND read_permission_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        VALUES (test_role_id, read_permission_id)
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Assigned read permission to test_role';
    ELSE
        RAISE NOTICE 'test_role or read permission not found';
    END IF;
END $$;

-- 6. Verify the assignment worked
SELECT 'After assignment - Permission counts:' as info;
SELECT 
    r.id,
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM public.roles r
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;
