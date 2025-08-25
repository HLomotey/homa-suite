-- Assign admin role to nanasefa@gmail.com user
-- Run this in Supabase SQL Editor

-- Step 1: Find the user ID for nanasefa@gmail.com
-- This will show the user ID - copy it for the next step
SELECT 'User ID for nanasefa@gmail.com:' as info, id as user_id, email 
FROM auth.users 
WHERE email = 'nanasefa@gmail.com';

-- Step 2: Ensure admin role exists
INSERT INTO public.roles (name, display_name, description, is_system_role, is_active, sort_order)
VALUES ('admin', 'Administrator', 'Full system administrator with all permissions', true, true, 1)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Get the admin role ID
SELECT 'Admin Role ID:' as info, id as role_id, name, display_name 
FROM public.roles 
WHERE name = 'admin';

-- Step 4: Assign admin role to the user
-- Replace the user_id with the actual UUID from Step 1
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
    u.id as user_id,
    r.id as role_id
FROM auth.users u
CROSS JOIN public.roles r
WHERE u.email = 'nanasefa@gmail.com' 
AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 5: Verify the assignment
SELECT 'Role Assignment Verification:' as info,
       u.email,
       r.name as role_name,
       r.display_name as role_display_name
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'nanasefa@gmail.com';

-- Step 6: Ensure permissions are populated (run setup script first if needed)
-- Check if permissions exist
SELECT 'Permissions Status:' as info, 
       COUNT(*) as total_permissions,
       COUNT(CASE WHEN is_active = true THEN 1 END) as active_permissions
FROM public.permissions;

-- Step 7: Grant all permissions to admin role (if permissions exist)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin' 
AND p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 8: Final verification - show effective permissions for the user
SELECT 'Final Verification - User Effective Permissions:' as info,
       permission_key
FROM get_user_effective_permissions(
    (SELECT id FROM auth.users WHERE email = 'nanasefa@gmail.com')
)
ORDER BY permission_key
LIMIT 10; -- Show first 10 permissions

-- Step 9: Show summary
SELECT 'Summary:' as info,
       u.email,
       COUNT(DISTINCT r.id) as roles_count,
       COUNT(DISTINCT p.permission_key) as permissions_count
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE u.email = 'nanasefa@gmail.com'
GROUP BY u.id, u.email;
