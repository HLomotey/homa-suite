-- Fix Properties Module Visibility in Permissions
-- This migration ensures the properties module is properly visible in the role permissions UI
-- Created: 2025-09-24

-- Ensure the properties module exists with correct display name
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('properties', 'Properties', 'Property and housing management', 20)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- Ensure the maintenance module exists as a separate module
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('maintenance', 'Maintenance', 'Maintenance management', 140)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- Generate permissions for properties module if they don't exist
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id, 
    a.id, 
    m.name || ':' || a.name, 
    m.display_name || ' - ' || a.display_name,
    'Permission to ' || a.display_name || ' in ' || m.display_name
FROM public.modules m
CROSS JOIN public.actions a
WHERE m.name = 'properties'
ON CONFLICT (module_id, action_id) DO NOTHING;

-- Generate permissions for maintenance module if they don't exist
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id, 
    a.id, 
    m.name || ':' || a.name, 
    m.display_name || ' - ' || a.display_name,
    'Permission to ' || a.display_name || ' in ' || m.display_name
FROM public.modules m
CROSS JOIN public.actions a
WHERE m.name = 'maintenance'
ON CONFLICT (module_id, action_id) DO NOTHING;

-- Ensure admin role has access to both properties and maintenance modules
INSERT INTO public.role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'properties', NOW(), NOW()
FROM public.roles r
WHERE r.name IN ('admin', 'Administrator')
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO public.role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'maintenance', NOW(), NOW()
FROM public.roles r
WHERE r.name IN ('admin', 'Administrator')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Ensure manager role has access to both properties and maintenance modules
INSERT INTO public.role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'properties', NOW(), NOW()
FROM public.roles r
WHERE r.name = 'manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO public.role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'maintenance', NOW(), NOW()
FROM public.roles r
WHERE r.name = 'manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Ensure Properties Manager has access to properties module
INSERT INTO public.role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'properties', NOW(), NOW()
FROM public.roles r
WHERE r.name = 'Properties Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Ensure Properties Manager has access to maintenance module
INSERT INTO public.role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'maintenance', NOW(), NOW()
FROM public.roles r
WHERE r.name = 'Properties Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Grant full permissions to admin for both modules
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE r.name IN ('admin', 'Administrator')
AND m.name IN ('properties', 'maintenance')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant full permissions to Properties Manager for both modules
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE r.name = 'Properties Manager'
AND m.name IN ('properties', 'maintenance')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant view, create, edit permissions to manager for both modules
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE r.name = 'manager'
AND m.name IN ('properties', 'maintenance')
AND a.name IN ('view', 'create', 'edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verification query to show properties and maintenance module assignments
SELECT 
    r.name as role_name,
    r.display_name,
    m.name as module_name,
    m.display_name as module_display_name
FROM public.roles r
JOIN public.role_modules rm ON r.id = rm.role_id
JOIN public.modules m ON rm.module_id = m.name
WHERE m.name IN ('properties', 'maintenance')
ORDER BY r.name, m.name;
