-- Add Properties Module Permissions
-- This migration ensures the properties module has proper permissions and role assignments

-- Ensure properties module exists (should already exist from RBAC migration)
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('properties', 'Properties', 'Property and housing management', 20)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- Ensure all actions exist for properties module
DO $$
DECLARE
    properties_module_id UUID;
    action_rec RECORD;
BEGIN
    -- Get properties module ID
    SELECT id INTO properties_module_id FROM public.modules WHERE name = 'properties';
    
    -- Ensure all permissions exist for properties module
    FOR action_rec IN SELECT id, name, display_name FROM public.actions LOOP
        INSERT INTO public.permissions (
            module_id, 
            action_id, 
            permission_key, 
            display_name, 
            description
        )
        VALUES (
            properties_module_id, 
            action_rec.id, 
            'properties:' || action_rec.name, 
            'Properties - ' || action_rec.display_name,
            'Permission to ' || action_rec.display_name || ' in Properties module'
        )
        ON CONFLICT (module_id, action_id) DO NOTHING;
    END LOOP;
END $$;

-- Update role permissions to include properties access
DO $$
DECLARE
    admin_role_id UUID;
    manager_role_id UUID;
    staff_role_id UUID;
    properties_module_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO manager_role_id FROM public.roles WHERE name = 'manager';
    SELECT id INTO staff_role_id FROM public.roles WHERE name = 'staff';
    SELECT id INTO properties_module_id FROM public.modules WHERE name = 'properties';
    
    -- Only proceed if we found the required roles and module
    IF admin_role_id IS NOT NULL AND properties_module_id IS NOT NULL THEN
        -- Admin gets all properties permissions (should already have them)
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT admin_role_id::UUID, p.id::UUID 
        FROM public.permissions p
        WHERE p.module_id = properties_module_id
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
    
    IF manager_role_id IS NOT NULL AND properties_module_id IS NOT NULL THEN
        -- Manager gets full properties access
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT manager_role_id::UUID, p.id::UUID 
        FROM public.permissions p
        JOIN public.actions a ON p.action_id = a.id
        WHERE p.module_id = properties_module_id
        AND a.name IN ('view', 'edit', 'create', 'delete', 'assign', 'export')
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
    
    IF staff_role_id IS NOT NULL AND properties_module_id IS NOT NULL THEN
        -- Staff gets basic properties access
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT staff_role_id::UUID, p.id::UUID 
        FROM public.permissions p
        JOIN public.actions a ON p.action_id = a.id
        WHERE p.module_id = properties_module_id
        AND a.name IN ('view', 'create', 'edit')
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
    
END $$;

-- Create a view to easily check properties permissions
CREATE OR REPLACE VIEW public.properties_permissions_view AS
SELECT 
    r.name AS role_name,
    r.display_name AS role_display_name,
    p.permission_key,
    p.display_name AS permission_display_name,
    a.name AS action_name,
    a.display_name AS action_display_name
FROM public.roles r
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE m.name = 'properties'
ORDER BY r.sort_order, a.sort_order;

-- Add properties module to role_modules table for sidebar navigation
DO $$
DECLARE
    admin_role_id UUID;
    manager_role_id UUID;
    staff_role_id UUID;
    user_rec RECORD;
BEGIN
    -- Get role IDs
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO manager_role_id FROM public.roles WHERE name = 'manager';
    SELECT id INTO staff_role_id FROM public.roles WHERE name = 'staff';
    
    -- Add properties module to admin role
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO public.role_modules (role_id, module_id)
        VALUES (admin_role_id, 'properties')
        ON CONFLICT (role_id, module_id) DO NOTHING;
    END IF;
    
    -- Add properties module to manager role
    IF manager_role_id IS NOT NULL THEN
        INSERT INTO public.role_modules (role_id, module_id)
        VALUES (manager_role_id, 'properties')
        ON CONFLICT (role_id, module_id) DO NOTHING;
    END IF;
    
    -- Add properties module to staff role
    IF staff_role_id IS NOT NULL THEN
        INSERT INTO public.role_modules (role_id, module_id)
        VALUES (staff_role_id, 'properties')
        ON CONFLICT (role_id, module_id) DO NOTHING;
        
        -- Assign staff role to users who don't have any roles yet
        FOR user_rec IN 
            SELECT DISTINCT u.id 
            FROM auth.users u
            LEFT JOIN public.user_roles ur ON u.id = ur.user_id
            WHERE ur.user_id IS NULL
        LOOP
            INSERT INTO public.user_roles (user_id, role_id, is_primary)
            VALUES (user_rec.id::UUID, staff_role_id::UUID, TRUE)
            ON CONFLICT (user_id, role_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;
