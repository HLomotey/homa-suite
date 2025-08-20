-- Sync Auth Users to Public Users Table
-- This populates the public.users table with auth.users that don't exist there yet

-- Create function to sync auth users to public users table
CREATE OR REPLACE FUNCTION public.sync_auth_to_public_users()
RETURNS TEXT AS $$
DECLARE
  sync_count INTEGER;
BEGIN
  -- Insert missing users from auth.users to public.users
  INSERT INTO public.users (
    id,
    email,
    role,
    is_active,
    last_login,
    email_verified,
    password_changed_at,
    two_factor_enabled,
    login_attempts,
    locked_until,
    created_at,
    updated_at,
    department,
    name,
    permissions
  )
  SELECT 
    au.id,
    au.email,
    'staff'::user_role as role, -- Default role
    true as is_active,
    au.last_sign_in_at as last_login,
    au.email_confirmed_at IS NOT NULL as email_verified,
    NULL as password_changed_at, -- Will be set when user changes password
    false as two_factor_enabled, -- Default to false
    0 as login_attempts, -- Default to 0
    NULL as locked_until, -- Not locked by default
    au.created_at,
    NOW() as updated_at,
    au.raw_user_meta_data->>'department' as department,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      SPLIT_PART(au.email, '@', 1)
    ) as name,
    NULL as permissions -- Will be managed through RBAC system
  FROM auth.users au
  WHERE au.email IS NOT NULL
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_login = EXCLUDED.last_login,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW(),
    name = COALESCE(EXCLUDED.name, users.name),
    department = COALESCE(EXCLUDED.department, users.department);
  
  GET DIAGNOSTICS sync_count = ROW_COUNT;
  
  RETURN 'Successfully synced ' || sync_count || ' auth users to public.users table';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial sync of existing auth users
SELECT public.sync_auth_to_public_users();

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Add comment for documentation
COMMENT ON FUNCTION public.sync_auth_to_public_users() IS 
'Syncs auth.users to public.users table. Call this function to populate public.users for any missing auth users.';

-- Show final results
SELECT 
  'Migration Complete - Auth Users Synced to Public Users' as status,
  COUNT(*) as total_public_users
FROM public.users;
