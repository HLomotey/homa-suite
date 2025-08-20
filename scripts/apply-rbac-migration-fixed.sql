-- First, check if the roles table exists and create it if needed
CREATE TABLE IF NOT EXISTS public.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

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

-- Create role_permissions table (if not exists)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE (role_id, permission_id)
);

-- Create user_roles junction table with proper foreign keys
CREATE TABLE IF NOT EXISTS public.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_primary ON public.user_roles(user_id, is_primary) WHERE is_primary = true;

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

-- Create view for user roles with permissions - FIXED VERSION
CREATE OR REPLACE VIEW public.user_roles_with_permissions AS
SELECT 
    ur.user_id,
    r.id AS role_id,
    r.name AS role_name,
    r.name AS role_display_name, -- Changed from r.display_name to r.name as a fallback
    ur.is_primary,
    array_agg(DISTINCT p.permission_key) AS permissions
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
WHERE r.is_active = TRUE
GROUP BY ur.user_id, r.id, r.name, ur.is_primary;

-- Insert default modules if they don't exist
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

-- Insert default actions if they don't exist
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

-- Insert admin role if it doesn't exist
INSERT INTO public.roles (name, display_name, description, is_system_role, sort_order) VALUES
('admin', 'Administrator', 'Full system access', TRUE, 10)
ON CONFLICT (name) DO NOTHING;

-- Create a view that explicitly shows the relationship between profiles and roles
-- Only using columns that actually exist in the profiles table
CREATE OR REPLACE VIEW public.profiles_with_roles AS
SELECT 
    p.id,
    ur.role_id,
    ur.is_primary,
    r.name as role_name,
    r.display_name as role_display_name,
    r.description as role_description
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_users_with_roles();

-- Create function to get users with their roles for the API
-- Simplified to only use existing columns
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id UUID,
    email VARCHAR(255),
    role_id BIGINT,
    role_name VARCHAR(50),
    role_display_name VARCHAR(100),
    role_description TEXT,
    is_primary_role BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        u.email::VARCHAR(255),
        ur.role_id,
        r.name::VARCHAR(50) as role_name,
        r.display_name::VARCHAR(100) as role_display_name,
        r.description as role_description,
        ur.is_primary as is_primary_role
    FROM public.profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    LEFT JOIN public.roles r ON ur.role_id = r.id
    ORDER BY u.email, ur.is_primary DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.profiles_with_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT USAGE ON SEQUENCE public.user_roles_id_seq TO authenticated;

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all user roles" ON public.user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
