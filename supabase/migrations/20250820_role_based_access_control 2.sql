-- Role-Based Access Control System
-- This migration creates a new role-based access control system
-- that allows users to have multiple roles and granular permissions

-- Create modules table (if not exists)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create actions table (if not exists)
CREATE TABLE IF NOT EXISTS public.actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create permissions table (if not exists)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) NOT NULL UNIQUE, -- Format: 'module:action'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (module_id, action_id)
);

-- Create roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create role_permissions table (if not exists)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE (role_id, permission_id)
);

-- Create user_roles table for multiple roles per user
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role_id)
);

-- Create user_permissions table for custom permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = granted, FALSE = explicitly denied
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, permission_id)
);

-- Add index for faster permission lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);

-- Create function to get user's effective permissions
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(p_user_id UUID)
RETURNS TABLE (permission_key TEXT) AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user has admin role
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id AND r.name = 'admin'
    ) INTO is_admin;
    
    -- If admin, return all permissions
    IF is_admin THEN
        RETURN QUERY SELECT p.permission_key FROM public.permissions p WHERE p.is_active = TRUE;
        RETURN;
    END IF;
    
    -- Get all permissions from user's roles
    RETURN QUERY
    WITH role_perms AS (
        SELECT DISTINCT p.permission_key
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND p.is_active = TRUE
    ),
    -- Get user's custom permissions
    user_perms AS (
        SELECT p.permission_key, up.is_granted, up.expires_at
        FROM public.user_permissions up
        JOIN public.permissions p ON up.permission_id = p.id
        WHERE up.user_id = p_user_id
        AND p.is_active = TRUE
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    )
    -- Combine role and user permissions, with user permissions taking precedence
    SELECT rp.permission_key
    FROM role_perms rp
    WHERE NOT EXISTS (
        SELECT 1 FROM user_perms up
        WHERE up.permission_key = rp.permission_key
        AND up.is_granted = FALSE
    )
    UNION
    SELECT up.permission_key
    FROM user_perms up
    WHERE up.is_granted = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(p_user_id UUID, p_permission_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.get_user_effective_permissions(p_user_id) 
        WHERE permission_key = p_permission_key
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for user roles with permissions
CREATE OR REPLACE VIEW public.user_roles_with_permissions AS
SELECT 
    ur.user_id,
    r.id AS role_id,
    r.name AS role_name,
    r.display_name AS role_display_name,
    ur.is_primary,
    array_agg(DISTINCT p.permission_key) AS permissions
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE r.is_active = TRUE
GROUP BY ur.user_id, r.id, r.name, r.display_name, ur.is_primary;

-- Insert default modules
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('dashboard', 'Dashboard', 'Main dashboard and analytics', 10),
('properties', 'Properties', 'Property management', 20),
('transport', 'Transport', 'Transport management', 30),
('hr', 'Human Resources', 'HR management', 40),
('finance', 'Finance', 'Financial management', 50),
('operations', 'Operations', 'Operations management', 60),
('staff', 'Staff', 'Staff management', 70),
('billing', 'Billing', 'Billing and payments', 80),
('users', 'Users', 'User management', 90),
('uploads', 'Uploads', 'File uploads', 100),
('attendance', 'Attendance', 'Attendance tracking', 110),
('payroll', 'Payroll', 'Payroll management', 120),
('settings', 'Settings', 'System settings', 130),
('maintenance', 'Maintenance', 'Maintenance management', 140)
ON CONFLICT (name) DO NOTHING;

-- Insert default actions
INSERT INTO public.actions (name, display_name, description, sort_order) VALUES
('view', 'View', 'View or read access', 10),
('edit', 'Edit', 'Edit or update access', 20),
('create', 'Create', 'Create or add access', 30),
('delete', 'Delete', 'Delete or remove access', 40),
('approve', 'Approve', 'Approval access', 50),
('reject', 'Reject', 'Rejection access', 60),
('export', 'Export', 'Export data access', 70),
('import', 'Import', 'Import data access', 80),
('assign', 'Assign', 'Assign to others', 90),
('admin', 'Administer', 'Administrative access', 100)
ON CONFLICT (name) DO NOTHING;

-- Generate permissions for each module and action
DO $$
DECLARE
    m RECORD;
    a RECORD;
BEGIN
    FOR m IN SELECT id, name, display_name FROM public.modules LOOP
        FOR a IN SELECT id, name, display_name FROM public.actions LOOP
            INSERT INTO public.permissions (
                module_id, 
                action_id, 
                permission_key, 
                display_name, 
                description
            )
            VALUES (
                m.id, 
                a.id, 
                m.name || ':' || a.name, 
                m.display_name || ' - ' || a.display_name,
                'Permission to ' || a.display_name || ' in ' || m.display_name
            )
            ON CONFLICT (module_id, action_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Insert default roles
INSERT INTO public.roles (name, display_name, description, is_system_role, sort_order) VALUES
('admin', 'Administrator', 'Full system access', TRUE, 10),
('staff', 'Staff', 'General staff access', TRUE, 20),
('manager', 'Manager', 'Department manager access', TRUE, 30),
('tenant', 'Tenant', 'Property tenant access', TRUE, 40),
('driver', 'Driver', 'Transport driver access', TRUE, 50),
('accountant', 'Accountant', 'Finance department access', TRUE, 60),
('hr_officer', 'HR Officer', 'Human resources access', TRUE, 70),
('maintenance', 'Maintenance Staff', 'Maintenance department access', TRUE, 80),
('guest', 'Guest', 'Limited guest access', TRUE, 90)
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin role
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT admin_role_id, id FROM public.permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;
END $$;

-- Assign basic permissions to other roles
DO $$
DECLARE
    staff_role_id UUID;
    manager_role_id UUID;
    tenant_role_id UUID;
    driver_role_id UUID;
    maintenance_role_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO staff_role_id FROM public.roles WHERE name = 'staff';
    SELECT id INTO manager_role_id FROM public.roles WHERE name = 'manager';
    SELECT id INTO tenant_role_id FROM public.roles WHERE name = 'tenant';
    SELECT id INTO driver_role_id FROM public.roles WHERE name = 'driver';
    SELECT id INTO maintenance_role_id FROM public.roles WHERE name = 'maintenance';
    
    -- Staff permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT staff_role_id, p.id 
    FROM public.permissions p
    JOIN public.modules m ON p.module_id = m.id
    JOIN public.actions a ON p.action_id = a.id
    WHERE (m.name IN ('dashboard', 'properties') AND a.name = 'view')
    OR (m.name = 'transport' AND a.name IN ('view', 'create'))
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Manager permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT manager_role_id, p.id 
    FROM public.permissions p
    JOIN public.modules m ON p.module_id = m.id
    JOIN public.actions a ON p.action_id = a.id
    WHERE (m.name IN ('dashboard', 'properties', 'staff', 'operations') AND a.name IN ('view', 'edit', 'create'))
    OR (m.name = 'transport' AND a.name IN ('view', 'edit', 'create', 'approve'))
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Tenant permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT tenant_role_id, p.id 
    FROM public.permissions p
    JOIN public.modules m ON p.module_id = m.id
    JOIN public.actions a ON p.action_id = a.id
    WHERE (m.name = 'dashboard' AND a.name = 'view')
    OR (m.name = 'maintenance' AND a.name IN ('view', 'create'))
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Driver permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT driver_role_id, p.id 
    FROM public.permissions p
    JOIN public.modules m ON p.module_id = m.id
    JOIN public.actions a ON p.action_id = a.id
    WHERE (m.name = 'dashboard' AND a.name = 'view')
    OR (m.name = 'transport' AND a.name IN ('view'))
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Maintenance permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT maintenance_role_id, p.id 
    FROM public.permissions p
    JOIN public.modules m ON p.module_id = m.id
    JOIN public.actions a ON p.action_id = a.id
    WHERE (m.name = 'dashboard' AND a.name = 'view')
    OR (m.name = 'maintenance' AND a.name IN ('view', 'edit', 'create'))
    ON CONFLICT (role_id, permission_id) DO NOTHING;
END $$;

-- Migrate existing users to the new role system
DO $$
DECLARE
    user_rec RECORD;
    role_id UUID;
BEGIN
    FOR user_rec IN SELECT id, role FROM auth.users WHERE role IS NOT NULL LOOP
        -- Find corresponding role in new system
        SELECT id INTO role_id FROM public.roles WHERE name = user_rec.role;
        
        IF role_id IS NOT NULL THEN
            -- Insert into user_roles table
            INSERT INTO public.user_roles (user_id, role_id, is_primary)
            VALUES (user_rec.id, role_id, TRUE)
            ON CONFLICT (user_id, role_id) DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- Add RLS policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admins full access to roles" ON public.roles
    USING (user_has_permission(auth.uid(), 'users:admin'));

CREATE POLICY "Allow read access to roles" ON public.roles
    FOR SELECT USING (user_has_permission(auth.uid(), 'users:view'));

CREATE POLICY "Allow admins full access to modules" ON public.modules
    USING (user_has_permission(auth.uid(), 'settings:admin'));

CREATE POLICY "Allow read access to modules" ON public.modules
    FOR SELECT USING (user_has_permission(auth.uid(), 'settings:view'));

CREATE POLICY "Allow admins full access to actions" ON public.actions
    USING (user_has_permission(auth.uid(), 'settings:admin'));

CREATE POLICY "Allow read access to actions" ON public.actions
    FOR SELECT USING (user_has_permission(auth.uid(), 'settings:view'));

CREATE POLICY "Allow admins full access to permissions" ON public.permissions
    USING (user_has_permission(auth.uid(), 'users:admin'));

CREATE POLICY "Allow read access to permissions" ON public.permissions
    FOR SELECT USING (user_has_permission(auth.uid(), 'users:view'));

CREATE POLICY "Allow admins full access to role_permissions" ON public.role_permissions
    USING (user_has_permission(auth.uid(), 'users:admin'));

CREATE POLICY "Allow read access to role_permissions" ON public.role_permissions
    FOR SELECT USING (user_has_permission(auth.uid(), 'users:view'));

CREATE POLICY "Allow admins full access to user_roles" ON public.user_roles
    USING (user_has_permission(auth.uid(), 'users:admin'));

CREATE POLICY "Allow users to see their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR user_has_permission(auth.uid(), 'users:view'));

CREATE POLICY "Allow admins full access to user_permissions" ON public.user_permissions
    USING (user_has_permission(auth.uid(), 'users:admin'));

CREATE POLICY "Allow users to see their own permissions" ON public.user_permissions
    FOR SELECT USING (auth.uid() = user_id OR user_has_permission(auth.uid(), 'users:view'));
