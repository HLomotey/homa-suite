-- Fix get_user_effective_permissions RPC function
-- The function was using wrong column names (p.resource, p.action don't exist)
-- Need to use proper permission structure
-- Created: 2025-09-08

-- First, check the actual structure of permissions table
-- The permissions table should have columns like: id, name, module_id, action_id, permission_key

CREATE OR REPLACE FUNCTION get_user_effective_permissions(p_user_id UUID)
RETURNS TABLE(
    resource TEXT,
    action TEXT,
    permission_key TEXT
) AS $$
BEGIN
    -- Return permissions based on user's role assignments
    -- Using proper column names from the permissions table structure
    RETURN QUERY
    SELECT 
        m.name as resource,
        a.name as action,
        p.permission_key as permission_key
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN roles r ON rp.role_id = r.id
    INNER JOIN profiles pr ON pr.role_id = r.id
    INNER JOIN modules m ON p.module_id = m.id
    INNER JOIN actions a ON p.action_id = a.id
    WHERE pr.user_id = p_user_id
      AND r.is_active = true
      AND p.is_active = true
      AND m.is_active = true
      AND a.is_active = true;
      
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
