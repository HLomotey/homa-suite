-- Populate permissions table with module-action combinations
-- This script creates permissions by combining modules and actions

-- First, let's create permissions for all module-action combinations
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

-- Create some basic permissions for common operations
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id,
    a.id,
    'all:all',
    'Full System Access',
    'Complete administrative access to all modules and actions'
FROM public.modules m, public.actions a
WHERE m.name = 'settings' AND a.name = 'admin'
LIMIT 1
ON CONFLICT (permission_key) DO NOTHING;

-- Grant all permissions to admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin' AND p.is_active = TRUE
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Show what we've created
SELECT 
    COUNT(*) as total_permissions,
    COUNT(DISTINCT module_id) as modules_count,
    COUNT(DISTINCT action_id) as actions_count
FROM public.permissions;

-- Show sample permissions
SELECT 
    p.permission_key,
    p.display_name,
    m.display_name as module_name,
    a.display_name as action_name
FROM public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
ORDER BY m.sort_order, a.sort_order
LIMIT 20;
