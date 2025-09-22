-- Migration: Add Termination Module to RBAC System
-- This enables the Termination module to appear in the sidebar and be assigned to roles
-- Created: 2025-09-17

-- Insert Termination module
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('termination', 'Termination', 'Employee termination requests and workflow management', 160)
ON CONFLICT (name) DO NOTHING;

-- Create permissions for termination module
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id,
    a.id,
    'termination:' || a.name,
    'Termination ' || a.display_name,
    'Permission to ' || LOWER(a.display_name) || ' termination requests'
FROM public.modules m
CROSS JOIN public.actions a
WHERE m.name = 'termination'
ON CONFLICT (permission_key) DO NOTHING;

-- Assign termination permissions to appropriate roles

-- Admin gets all termination permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE m.name = 'termination'
AND (r.name = 'Admin' OR r.name = 'Administrator')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Manager gets all termination permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE m.name = 'termination'
AND (r.name = 'HR Manager' OR r.name = 'HR Officer')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager gets view, create, edit, and approve permissions (for their direct reports)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE m.name = 'termination' 
AND (r.name = 'Manager' OR r.name = 'Properties Manager')
AND a.name IN ('view', 'create', 'edit', 'approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Finance Manager gets view and approve permissions (for final processing)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE m.name = 'termination' 
AND r.name = 'Finance Manager'
AND a.name IN ('view', 'approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add termination module to role_modules table for navigation
DO $$
DECLARE
    termination_module_name TEXT := 'termination';
    role_record RECORD;
BEGIN
    -- Add termination module to role_modules for specified roles (only if they exist)
    FOR role_record IN 
        SELECT id, name FROM roles 
        WHERE name IN ('Admin', 'Administrator', 'Manager', 'Properties Manager', 'HR Manager', 'HR Officer', 'Finance Manager')
    LOOP
        INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
        VALUES (role_record.id, termination_module_name, NOW(), NOW())
        ON CONFLICT (role_id, module_id) DO NOTHING;
        
        RAISE NOTICE 'Added termination module access for role: %', role_record.name;
    END LOOP;
END $$;

-- Verification query
DO $$
DECLARE
    module_count INTEGER;
    permission_count INTEGER;
    role_module_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO module_count FROM public.modules WHERE name = 'termination';
    SELECT COUNT(*) INTO permission_count FROM public.permissions p 
    JOIN public.modules m ON p.module_id = m.id 
    WHERE m.name = 'termination';
    SELECT COUNT(*) INTO role_module_count FROM public.role_modules WHERE module_id = 'termination';
    
    RAISE NOTICE 'Termination module added: % modules, % permissions created, % role assignments', 
                 module_count, permission_count, role_module_count;
END $$;
