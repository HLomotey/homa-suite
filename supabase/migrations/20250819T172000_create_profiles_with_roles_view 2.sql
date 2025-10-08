-- Create view to join profiles with their roles
-- This resolves the relationship issue between profiles and roles

-- Create a view that shows profiles with their roles
CREATE OR REPLACE VIEW public.profiles_with_roles AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.status,
    p.created_at,
    p.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'role_id', r.id,
                'role_name', r.name,
                'role_display_name', r.display_name,
                'is_primary', ur.is_primary,
                'assigned_at', ur.assigned_at
            )
        ) FILTER (WHERE r.id IS NOT NULL), 
        '[]'::json
    ) as roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id AND r.is_active = TRUE
GROUP BY p.id, p.email, p.full_name, p.status, p.created_at, p.updated_at;

-- Create a simpler view for basic profile-role relationships
CREATE OR REPLACE VIEW public.user_profile_roles AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.status,
    r.id as role_id,
    r.name as role_name,
    r.display_name as role_display_name,
    ur.is_primary,
    ur.assigned_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id AND r.is_active = TRUE;

-- Enable RLS on the views
ALTER VIEW public.profiles_with_roles OWNER TO postgres;
ALTER VIEW public.user_profile_roles OWNER TO postgres;

-- Grant permissions
GRANT SELECT ON public.profiles_with_roles TO authenticated;
GRANT SELECT ON public.user_profile_roles TO authenticated;

-- Add comments
COMMENT ON VIEW public.profiles_with_roles IS 'View that joins profiles with their assigned roles in JSON format';
COMMENT ON VIEW public.user_profile_roles IS 'Flattened view of user profiles and their roles for easier querying';

-- Show results
SELECT 'Views created successfully' as status;
