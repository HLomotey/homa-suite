-- Fix the relationship between profiles and roles tables
-- This script addresses the foreign key relationship issue

-- First, ensure the user_roles table exists with proper foreign keys
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

-- Update the profiles table to include a default_role_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'default_role_id') THEN
        ALTER TABLE public.profiles ADD COLUMN default_role_id BIGINT REFERENCES public.roles(id);
    END IF;
END $$;

-- Create a view that joins profiles with their roles through user_roles
CREATE OR REPLACE VIEW public.profiles_with_roles AS
SELECT 
    p.*,
    ur.role_id,
    ur.is_primary,
    r.name as role_name,
    r.description as role_description,
    r.permissions as role_permissions
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id;

-- Create a function to get user roles with profile information
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    avatar TEXT,
    department TEXT,
    status TEXT,
    last_active TIMESTAMP WITH TIME ZONE,
    role_id BIGINT,
    role_name TEXT,
    role_description TEXT,
    is_primary_role BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.name,
        p.avatar,
        p.department,
        p.status,
        p.last_active,
        ur.role_id,
        r.name as role_name,
        r.description as role_description,
        ur.is_primary as is_primary_role,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    LEFT JOIN public.roles r ON ur.role_id = r.id
    ORDER BY p.name, ur.is_primary DESC;
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
