-- Fix missing get_user_effective_permissions RPC function
-- This script ensures the function exists in your database

-- Drop function if it exists (to recreate with correct signature)
DROP FUNCTION IF EXISTS get_user_effective_permissions(UUID);

-- Create get_user_effective_permissions RPC function
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
        SPLIT_PART(p.name, ':', 1) as resource,
        SPLIT_PART(p.name, ':', 2) as action,
        p.name as permission_key
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN roles r ON rp.role_id = r.id
    INNER JOIN profiles pr ON pr.role_id = r.id
    WHERE pr.id = p_user_id
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

-- Verify function was created
SELECT 'Function get_user_effective_permissions created successfully' as status;
