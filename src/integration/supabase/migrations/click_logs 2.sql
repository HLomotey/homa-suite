-- Create click_logs table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.click_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    location JSONB,
    url TEXT,
    element_id TEXT,
    element_class TEXT,
    action TEXT,
    component_name TEXT,
    page_title TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for click_logs
ALTER TABLE public.click_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own logs
CREATE POLICY "Users can insert their own click logs"
    ON public.click_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own logs
CREATE POLICY "Users can view their own click logs"
    ON public.click_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow admins to view all logs
CREATE POLICY "Admins can view all click logs"
    ON public.click_logs
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = auth.uid()
        AND p.permission_key = 'admin.view_logs'
    ));

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS click_logs_user_id_idx ON public.click_logs (user_id);

-- Create index on timestamp for faster time-based queries
CREATE INDEX IF NOT EXISTS click_logs_timestamp_idx ON public.click_logs (timestamp);
