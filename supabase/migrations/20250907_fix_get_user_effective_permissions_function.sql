-- Fix get_user_effective_permissions RPC function
-- The function was using wrong column for user lookup (profiles.id instead of profiles.user_id)
-- Created: 2025-09-07

CREATE OR REPLACE FUNCTION get_user_effective_permissions(p_user_id UUID)
RETURNS TABLE(
    resource TEXT,
    action TEXT,
    permission_key TEXT
) AS $$
BEGIN
    -- Return permissions based on user's role assignments
    RETURN QUERY
    SELECT 
        p.resource as resource,
        p.action as action,
        p.name as permission_key
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN roles r ON rp.role_id = r.id
    INNER JOIN profiles pr ON pr.role_id = r.id
    WHERE pr.user_id = p_user_id  -- Fixed: was pr.id = p_user_id
      AND r.is_active = true;
      
    -- If no permissions found, return empty result
    IF NOT FOUND THEN
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO authenticated;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO service_role;
