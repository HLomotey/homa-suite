-- Debug script to check admin user permissions setup
-- Run this in Supabase SQL Editor to verify admin user configuration

-- 1. Check if admin role exists
SELECT 'Admin Role Check' as check_type, * FROM roles WHERE name = 'admin';

-- 2. Check user_roles assignments (replace with your actual user ID)
SELECT 'User Roles Check' as check_type, 
       ur.user_id, 
       r.name as role_name, 
       r.display_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = auth.uid(); -- This will show roles for current authenticated user

-- 3. Check permissions assigned to admin role
SELECT 'Admin Role Permissions' as check_type,
       r.name as role_name,
       p.permission_key,
       p.display_name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
ORDER BY p.permission_key;

-- 4. Test the RPC function for current user
SELECT 'Effective Permissions' as check_type, 
       permission_key 
FROM get_user_effective_permissions(auth.uid())
ORDER BY permission_key;

-- 5. Check if permissions table is populated
SELECT 'Permissions Count' as check_type, 
       COUNT(*) as total_permissions,
       COUNT(CASE WHEN is_active = true THEN 1 END) as active_permissions
FROM permissions;

-- 6. Check if role_permissions table has data
SELECT 'Role Permissions Count' as check_type,
       r.name as role_name,
       COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;
