-- Fix get_user_effective_permissions RPC function to match actual table structure
-- The original permissions table has 'resource' and 'action' columns, not module_id/action_id
-- Created: 2025-09-15
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_effective_permissions(UUID);
-- Create the corrected function using the actual table structure
CREATE OR REPLACE FUNCTION get_user_effective_permissions(p_user_id UUID) RETURNS TABLE(
        permission_name TEXT,
        resource TEXT,
        action TEXT
    ) AS $$ BEGIN -- Return permissions based on user's role assignments
    -- Using the actual column names from the original permissions table
    RETURN QUERY
SELECT DISTINCT p.name as permission_name,
    p.resource as resource,
    p.action as action
FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN roles r ON rp.role_id = r.id
    INNER JOIN user_roles ur ON r.id = ur.role_id
WHERE ur.user_id = p_user_id;
-- If no permissions found, return empty result
IF NOT FOUND THEN RETURN;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO authenticated;
-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO service_role;
-- Grant execute permission to anon (for initial auth checks)
GRANT EXECUTE ON FUNCTION get_user_effective_permissions(UUID) TO anon;