-- Fixed Auth Users to Profiles Sync (No Trigger Version)
-- This creates a manual sync function since we cannot create triggers on auth.users

-- Create a function to manually sync auth users to profiles
CREATE OR REPLACE FUNCTION public.sync_auth_users_to_profiles()
RETURNS TEXT AS $$
DECLARE
  sync_count INTEGER;
BEGIN
  -- Insert missing profiles for auth users that don't have profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    status,
    created_at,
    updated_at
  )
  SELECT 
    au.id,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name', 
      SPLIT_PART(au.email, '@', 1)
    ) as full_name,
    'active' as status,
    au.created_at,
    NOW() as updated_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL
    AND au.email IS NOT NULL
  ON CONFLICT (id) DO NOTHING;
  
  GET DIAGNOSTICS sync_count = ROW_COUNT;
  
  RETURN 'Successfully synced ' || sync_count || ' auth users to profiles table';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial sync of existing auth users
SELECT public.sync_auth_users_to_profiles();

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Add comment for documentation
COMMENT ON FUNCTION public.sync_auth_users_to_profiles() IS 
'Manually syncs auth.users to profiles table. Call this function to populate profiles for any missing auth users.';

-- Show final results
SELECT 
  'Migration Complete - Manual Sync Function Created' as status,
  COUNT(*) as total_profiles
FROM public.profiles;
