-- Fix get_user_effective_permissions RPC function to work with new RBAC schema
-- The new RBAC schema uses module_id/action_id with foreign keys instead of resource/action text fields
-- Created: 2025-09-25

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_effective_permissions(UUID);

-- Create the corrected function using the new RBAC schema structure
CREATE OR REPLACE FUNCTION get_user_effective_permissions(p_user_id UUID) 
RETURNS TABLE(
    permission_key TEXT,
    module_name TEXT,
    action_name TEXT,
    display_name TEXT
) AS $$
BEGIN
    -- Return permissions based on user's role assignments using new RBAC schema
    RETURN QUERY
    SELECT DISTINCT 
        p.permission_key as permission_key,
        m.name as module_name,
        a.name as action_name,
        p.display_name as display_name
    FROM permissions p
        INNER JOIN modules m ON p.module_id = m.id
        INNER JOIN actions a ON p.action_id = a.id
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN roles r ON rp.role_id = r.id
        INNER JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
        AND p.is_active = true
        AND m.is_active = true
        AND a.is_active = true
        AND r.is_active = true;

    -- Also include direct user permissions (custom permissions)
    RETURN QUERY
    SELECT DISTINCT 
        p.permission_key as permission_key,
        m.name as module_name,
        a.name as action_name,
        p.display_name as display_name
    FROM permissions p
        INNER JOIN modules m ON p.module_id = m.id
        INNER JOIN actions a ON p.action_id = a.id
        INNER JOIN user_permissions up ON p.id = up.permission_id
    WHERE up.user_id = p_user_id
        AND up.is_granted = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
        AND p.is_active = true
        AND m.is_active = true
        AND a.is_active = true;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO authenticated;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO service_role;

-- Grant execute permission to anon (for initial auth checks)
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO anon;

-- Create user_has_permission helper function for easier permission checking
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id UUID, p_permission_key TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    permission_count INTEGER;
BEGIN
    -- Check if user has the permission through roles or direct assignment
    SELECT COUNT(*) INTO permission_count
    FROM get_user_effective_permissions(p_user_id)
    WHERE permission_key = p_permission_key;
    
    RETURN permission_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for the helper function
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO anon;
