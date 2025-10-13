-- Update billing table RLS policies to allow specific roles to delete records
-- This fixes the delete functionality for Administrator, Admin, and Properties Manager roles

-- Drop existing delete policies
DROP POLICY IF EXISTS "billing_delete_policy" ON public.billing;
DROP POLICY IF EXISTS "billing_delete_policy_role_based" ON public.billing;

-- Create new delete policy that allows specific roles
CREATE POLICY "billing_delete_policy_role_based" ON public.billing
FOR DELETE TO authenticated
USING (
  -- Allow if user has admin role or is properties manager
  EXISTS (
    SELECT 1 FROM auth.users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id = auth.uid()
    AND (
      r.name IN ('Administrator', 'Admin', 'Properties Manager') OR
      r.name ILIKE '%admin%' OR
      r.name ILIKE '%manager%'
    )
  )
  OR
  -- Fallback: allow all authenticated users if roles system is not set up
  NOT EXISTS (SELECT 1 FROM roles LIMIT 1)
);

-- Also update the general policies to be more permissive for these roles
-- Drop and recreate update policy with role-based access
DROP POLICY IF EXISTS "billing_update_policy" ON public.billing;
DROP POLICY IF EXISTS "billing_update_policy_role_based" ON public.billing;

CREATE POLICY "billing_update_policy_role_based" ON public.billing
FOR UPDATE TO authenticated
USING (
  -- Allow if user has admin role or is properties manager
  EXISTS (
    SELECT 1 FROM auth.users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id = auth.uid()
    AND (
      r.name IN ('Administrator', 'Admin', 'Properties Manager', 'Finance Manager', 'HR Manager') OR
      r.name ILIKE '%admin%' OR
      r.name ILIKE '%manager%'
    )
  )
  OR
  -- Fallback: allow all authenticated users if roles system is not set up
  NOT EXISTS (SELECT 1 FROM roles LIMIT 1)
)
WITH CHECK (
  -- Same check for updates
  EXISTS (
    SELECT 1 FROM auth.users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id = auth.uid()
    AND (
      r.name IN ('Administrator', 'Admin', 'Properties Manager', 'Finance Manager', 'HR Manager') OR
      r.name ILIKE '%admin%' OR
      r.name ILIKE '%manager%'
    )
  )
  OR
  -- Fallback: allow all authenticated users if roles system is not set up
  NOT EXISTS (SELECT 1 FROM roles LIMIT 1)
);

-- Add comment for documentation
COMMENT ON POLICY "billing_delete_policy_role_based" ON billing IS 'Allows Administrator, Admin, and Properties Manager roles to delete billing records';
COMMENT ON POLICY "billing_update_policy_role_based" ON billing IS 'Allows management roles to update billing records';

-- Grant explicit permissions at the table level as well
GRANT DELETE ON billing TO authenticated;
GRANT UPDATE ON billing TO authenticated;
