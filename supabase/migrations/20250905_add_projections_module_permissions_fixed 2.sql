-- Migration: Add Projections Module to RBAC System
-- This enables the Projections module to appear in the sidebar and be assigned to roles

-- Insert Projections module
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('projections', 'Projections', 'Financial projections and revenue forecasting', 155)
ON CONFLICT (name) DO NOTHING;

-- Create permissions for projections module using direct JOIN approach
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id,
    a.id,
    'projections:' || a.name,
    'Projections ' || a.display_name,
    'Permission to ' || LOWER(a.display_name) || ' projections'
FROM public.modules m
CROSS JOIN public.actions a
WHERE m.name = 'projections'
ON CONFLICT (permission_key) DO NOTHING;

-- Assign projections permissions to appropriate roles using direct INSERT approach
-- Admin gets all projections permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE m.name = 'projections'
AND (r.name = 'Admin' OR r.name = 'Administrator')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Finance Manager gets all projections permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE m.name = 'projections'
AND r.name = 'Finance Manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager gets view, edit, create, and approve permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE m.name = 'projections' 
AND (r.name = 'Manager' OR r.name = 'Properties Manager')
AND a.name IN ('view', 'edit', 'create', 'approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Officer gets view and create permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE m.name = 'projections' 
AND (r.name = 'HR Officer' OR r.name = 'HR Manager')
AND a.name IN ('view', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add projections module to role_modules table for navigation
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'projections', NOW(), NOW()
FROM roles r 
WHERE r.name IN ('Admin', 'Administrator', 'Manager', 'Properties Manager', 'Finance Manager', 'HR Manager', 'HR Officer')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Verification query
DO $$
DECLARE
    module_count INTEGER;
    permission_count INTEGER;
    role_module_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO module_count FROM public.modules WHERE name = 'projections';
    SELECT COUNT(*) INTO permission_count FROM public.permissions p 
    JOIN public.modules m ON p.module_id = m.id 
    WHERE m.name = 'projections';
    SELECT COUNT(*) INTO role_module_count FROM public.role_modules WHERE module_id = 'projections';
    
    RAISE NOTICE 'Projections module added: % modules, % permissions created, % role assignments', 
                 module_count, permission_count, role_module_count;
END $$;
