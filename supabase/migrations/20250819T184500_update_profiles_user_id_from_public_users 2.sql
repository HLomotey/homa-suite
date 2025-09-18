-- Migration: Update profiles.user_id with public.users.id
-- This migration ensures that profiles.user_id references the correct user ID from public.users table
-- Created: 2025-08-19

-- Update profiles.user_id to match public.users.id based on email
UPDATE public.profiles 
SET user_id = public.users.id
FROM public.users
WHERE public.profiles.email = public.users.email
  AND public.profiles.user_id IS DISTINCT FROM public.users.id;

-- Log the number of updated records
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % profile records with correct user_id from public.users', updated_count;
END $$;

-- Verify the update by showing mismatched records (should be empty after update)
DO $$
DECLARE
    mismatch_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mismatch_count
    FROM public.profiles p
    LEFT JOIN public.users u ON p.email = u.email
    WHERE p.user_id IS DISTINCT FROM u.id;
    
    IF mismatch_count > 0 THEN
        RAISE WARNING 'Still have % profiles with mismatched user_id', mismatch_count;
    ELSE
        RAISE NOTICE 'All profiles now have correct user_id references';
    END IF;
END $$;
