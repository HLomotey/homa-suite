-- Drop the view if it exists
DROP VIEW IF EXISTS public.user_roles_with_permissions;

-- Create the view with the correct column references
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
