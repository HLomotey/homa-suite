-- Fix notifications RLS policy that's causing permission denied error
-- The issue is that the admin policy tries to query auth.users table which causes permission errors

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Create a simpler admin policy that doesn't query auth.users
-- Instead, we'll rely on the service role policy for admin operations
CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (
        auth.uid() IS NOT NULL AND 
        (
            -- Check if user has admin role in their JWT claims
            auth.jwt() ->> 'role' = 'admin' OR
            auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
            -- Allow service role
            auth.role() = 'service_role'
        )
    );

-- Also ensure we have a policy that allows authenticated users to insert notifications
-- This is needed for system-generated notifications
CREATE POLICY IF NOT EXISTS "Authenticated users can create system notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    );
