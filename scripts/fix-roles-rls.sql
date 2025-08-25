-- Drop existing RLS policies for roles table if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.roles;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.roles;

-- Enable RLS on the roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read roles
CREATE POLICY "Enable read access for authenticated users"
ON public.roles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users with admin permissions to insert/update/delete roles
CREATE POLICY "Enable write access for admin users"
ON public.roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

-- Temporarily disable RLS for development if needed
-- ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- Grant permissions to the authenticated role
GRANT SELECT ON public.roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT USAGE ON SEQUENCE public.roles_id_seq TO authenticated;
