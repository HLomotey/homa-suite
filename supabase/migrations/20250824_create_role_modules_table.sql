-- Create role_modules table for simplified navigation-based permissions
CREATE TABLE IF NOT EXISTS role_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique role-module combinations
    UNIQUE(role_id, module_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_role_modules_role_id ON role_modules(role_id);
CREATE INDEX IF NOT EXISTS idx_role_modules_module_id ON role_modules(module_id);

-- Add RLS policies
ALTER TABLE role_modules ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read role modules
CREATE POLICY "Users can view role modules" ON role_modules
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admins to manage role modules
CREATE POLICY "Admins can manage role modules" ON role_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.id = auth.uid()
            AND r.name IN ('Administrator', 'Super Admin')
        )
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_role_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_role_modules_updated_at
    BEFORE UPDATE ON role_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_role_modules_updated_at();
