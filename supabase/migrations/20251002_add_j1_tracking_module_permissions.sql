-- Migration: Add J-1 Tracking Module to RBAC System
-- This enables the J-1 Tracking module to appear in the sidebar and be assigned to roles
-- Created: 2025-10-02

-- Insert J-1 Tracking module
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('j1-tracking', 'J-1 Tracking', 'J-1 participant program tracking and monitoring system', 170)
ON CONFLICT (name) DO NOTHING;

-- Create permissions for j1-tracking module
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id,
    a.id,
    'j1-tracking:' || a.name,
    'J-1 Tracking ' || a.display_name,
    'Permission to ' || LOWER(a.display_name) || ' J-1 participant records'
FROM public.modules m
CROSS JOIN public.actions a
WHERE m.name = 'j1-tracking'
ON CONFLICT (permission_key) DO NOTHING;

-- Assign j1-tracking permissions to appropriate roles

-- Admin gets all j1-tracking permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE m.name = 'j1-tracking'
AND (r.name = 'Admin' OR r.name = 'Administrator')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Manager gets all j1-tracking permissions (primary users)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE m.name = 'j1-tracking'
AND (r.name = 'HR Manager' OR r.name = 'HR Officer')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Operations Manager gets all j1-tracking permissions (program oversight)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE m.name = 'j1-tracking'
AND (r.name = 'Operations Manager' OR r.name = 'Operations Officer')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager gets view, create, and edit permissions (for participants under their supervision)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE m.name = 'j1-tracking' 
AND (r.name = 'Manager' OR r.name = 'Properties Manager')
AND a.name IN ('view', 'create', 'edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Finance Manager gets view permissions (for reporting and compliance)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE m.name = 'j1-tracking' 
AND r.name = 'Finance Manager'
AND a.name IN ('view')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add j1-tracking module to role_modules table for navigation
DO $$
DECLARE
    j1_tracking_module_name TEXT := 'j1-tracking';
    role_record RECORD;
BEGIN
    -- Add j1-tracking module to role_modules for specified roles (only if they exist)
    FOR role_record IN 
        SELECT id, name FROM roles 
        WHERE name IN ('Admin', 'Administrator', 'Manager', 'Properties Manager', 'HR Manager', 'HR Officer', 'Operations Manager', 'Operations Officer', 'Finance Manager')
    LOOP
        INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
        VALUES (role_record.id, j1_tracking_module_name, NOW(), NOW())
        ON CONFLICT (role_id, module_id) DO NOTHING;
        
        RAISE NOTICE 'Added j1-tracking module access for role: %', role_record.name;
    END LOOP;
END $$;

-- Verification query
DO $$
DECLARE
    module_count INTEGER;
    permission_count INTEGER;
    role_module_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO module_count FROM public.modules WHERE name = 'j1-tracking';
    SELECT COUNT(*) INTO permission_count FROM public.permissions p 
    JOIN public.modules m ON p.module_id = m.id 
    WHERE m.name = 'j1-tracking';
    SELECT COUNT(*) INTO role_module_count FROM public.role_modules WHERE module_id = 'j1-tracking';
    
    RAISE NOTICE 'J-1 Tracking module added: % modules, % permissions created, % role assignments', 
                 module_count, permission_count, role_module_count;
END $$;
