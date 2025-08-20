-- We won't create a new table since it already exists with a specific schema
-- Just ensure the user_role type exists (in case it doesn't)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'staff');
    END IF;
END
$$;

-- Make sure the update_users_updated_at function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_users_updated_at'
    ) THEN
        CREATE OR REPLACE FUNCTION update_users_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END
$$;

-- Enable Row Level Security if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON users;
DROP POLICY IF EXISTS "Allow individual write access" ON users;
DROP POLICY IF EXISTS "Allow service role full access" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON users;
DROP POLICY IF EXISTS "Allow users to insert their own record" ON users;
DROP POLICY IF EXISTS "Allow users to update their own record" ON users;
DROP POLICY IF EXISTS "Allow admins to manage all users" ON users;

-- Create policies for users table
-- 1. Allow all authenticated users to read all user records
CREATE POLICY "Allow authenticated users to read all users" 
    ON users FOR SELECT 
    USING (auth.role() = 'authenticated');

-- 2. Allow users to create their own record (matching auth.uid)
CREATE POLICY "Allow users to insert their own record" 
    ON users FOR INSERT 
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- 3. Allow users to update only their own record
CREATE POLICY "Allow users to update their own record" 
    ON users FOR UPDATE 
    USING (auth.uid() = id OR auth.role() = 'service_role');

-- 4. Allow admins to manage all users
CREATE POLICY "Allow admins to manage all users" 
    ON users FOR ALL 
    USING (
        auth.role() = 'service_role' OR 
        (
            SELECT role = 'admin'::public.user_role 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Create function to automatically create a user record when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email,
        role,
        is_active,
        email_verified,
        name
    )
    VALUES (
        new.id, 
        new.email,
        'staff'::public.user_role,
        true,
        new.email_confirmed_at IS NOT NULL,
        new.raw_user_meta_data->>'name'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
