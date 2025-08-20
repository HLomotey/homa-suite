-- Fix the profiles_with_roles view to use correct column names
-- First, let's create the view without the email column since it doesn't exist in profiles

CREATE OR REPLACE VIEW public.profiles_with_roles AS
SELECT 
    p.id,
    p.name,
    p.avatar,
    p.department,
    p.status,
    p.last_active,
    p.created_at,
    p.updated_at,
    ur.role_id,
    ur.is_primary,
    r.name as role_name,
    r.display_name as role_display_name,
    r.description as role_description
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id;

-- Update the function to get users with roles (without email from profiles)
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id UUID,
    name TEXT,
    avatar TEXT,
    department TEXT,
    status TEXT,
    last_active TIMESTAMP WITH TIME ZONE,
    role_id BIGINT,
    role_name TEXT,
    role_display_name TEXT,
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
        p.name,
        p.avatar,
        p.department,
        p.status,
        p.last_active,
        ur.role_id,
        r.name as role_name,
        r.display_name as role_display_name,
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

-- If you need email, get it from auth.users instead
CREATE OR REPLACE VIEW public.profiles_with_roles_and_email AS
SELECT 
    p.id,
    u.email,
    p.name,
    p.avatar,
    p.department,
    p.status,
    p.last_active,
    p.created_at,
    p.updated_at,
    ur.role_id,
    ur.is_primary,
    r.name as role_name,
    r.display_name as role_display_name,
    r.description as role_description
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id;

-- Grant permissions
GRANT SELECT ON public.profiles_with_roles TO authenticated;
GRANT SELECT ON public.profiles_with_roles_and_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;
