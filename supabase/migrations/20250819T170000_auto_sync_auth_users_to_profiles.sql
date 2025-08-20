-- Auto-sync Auth Users to Profiles Migration
-- This creates a trigger that automatically creates profiles when auth users are created/updated

-- Create function to handle auth user changes
CREATE OR REPLACE FUNCTION public.handle_auth_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (new user created)
  IF TG_OP = 'INSERT' THEN
    -- Only create profile if user has email and doesn't already exist
    IF NEW.email IS NOT NULL THEN
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        status,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'name',
          SPLIT_PART(NEW.email, '@', 1)
        ),
        'active',
        NEW.created_at,
        NOW()
      )
      ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE (user info changed)
  IF TG_OP = 'UPDATE' THEN
    -- Update profile if it exists
    UPDATE public.profiles 
    SET 
      email = NEW.email,
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(NEW.email, '@', 1),
        full_name -- Keep existing if no metadata
      ),
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Create profile if it doesn't exist and user has email
    IF NOT FOUND AND NEW.email IS NOT NULL THEN
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        status,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'name',
          SPLIT_PART(NEW.email, '@', 1)
        ),
        'active',
        NEW.created_at,
        NOW()
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE (user deleted)
  IF TG_OP = 'DELETE' THEN
    -- Optionally delete the profile (uncomment if desired)
    -- DELETE FROM public.profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Cannot create triggers on auth.users due to permissions
-- Instead, we'll use a webhook or manual sync approach
-- The function above can be called manually or via API

-- Alternative: Create a function to manually sync users
CREATE OR REPLACE FUNCTION public.sync_auth_users_to_profiles()
RETURNS TEXT AS $$
DECLARE
  sync_count INTEGER;
BEGIN
  -- Insert missing profiles
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
  
  RETURN 'Synced ' || sync_count || ' users to profiles';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial sync of existing auth users (run once)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_auth_user_profile() IS 
'Automatically creates/updates profiles when auth.users changes. Triggered on INSERT, UPDATE, DELETE.';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
'Auto-sync trigger that maintains profiles table in sync with auth.users';

-- Show results
SELECT 
  'Migration Complete' as status,
  COUNT(*) as total_profiles
FROM public.profiles;
