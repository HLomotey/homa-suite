-- Simplified fix for billing delete permissions
-- This creates a more permissive policy that works with the current auth setup

-- Drop existing policies
DROP POLICY IF EXISTS "billing_delete_policy" ON public.billing;
DROP POLICY IF EXISTS "billing_delete_policy_role_based" ON public.billing;
DROP POLICY IF EXISTS "billing_update_policy" ON public.billing;
DROP POLICY IF EXISTS "billing_update_policy_role_based" ON public.billing;

-- Create simple delete policy for authenticated users
CREATE POLICY "billing_delete_authenticated" ON public.billing
FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);

-- Create simple update policy for authenticated users
CREATE POLICY "billing_update_authenticated" ON public.billing
FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure table-level permissions are granted
GRANT DELETE ON billing TO authenticated;
GRANT UPDATE ON billing TO authenticated;
GRANT SELECT ON billing TO authenticated;
GRANT INSERT ON billing TO authenticated;

-- Also ensure permissions on related tables
GRANT DELETE ON billing_deductions TO authenticated;
GRANT UPDATE ON billing_deductions TO authenticated;
GRANT SELECT ON billing_deductions TO authenticated;
GRANT INSERT ON billing_deductions TO authenticated;

-- Add comments for documentation
COMMENT ON POLICY "billing_delete_authenticated" ON billing IS 'Allows all authenticated users to delete billing records';
COMMENT ON POLICY "billing_update_authenticated" ON billing IS 'Allows all authenticated users to update billing records';
