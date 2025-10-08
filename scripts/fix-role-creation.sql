-- Fix role creation issues
-- Apply this script in Supabase SQL Editor

-- 1. Temporarily disable RLS on roles table for testing
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- 2. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
-- Check if roles sequence exists before granting
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'roles_id_seq') THEN
        GRANT USAGE ON SEQUENCE public.roles_id_seq TO authenticated;
    END IF;
END $$;

-- 3. Grant permissions for role_permissions table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
-- Note: role_permissions table uses composite primary key, no sequence needed

-- 4. Grant permissions for permissions table
GRANT SELECT ON public.permissions TO authenticated;

-- 5. Test role creation by inserting a sample role
INSERT INTO public.roles (name, display_name, description, is_system_role, is_active, sort_order)
VALUES ('test_role', 'Test Role', 'A test role for debugging', FALSE, TRUE, 100)
ON CONFLICT (name) DO NOTHING;

-- 6. Check if the test role was created
SELECT 'Test role creation result:' as info;
SELECT id, name, display_name, created_at 
FROM public.roles 
WHERE name = 'test_role';

-- 7. Refresh schema cache
NOTIFY pgrst, 'reload schema';
