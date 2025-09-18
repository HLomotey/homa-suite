-- Add Analytics Module Permissions
-- This migration adds the analytics module and its permissions to the RBAC system

-- Insert the analytics module if it doesn't exist
INSERT INTO modules (name, display_name, description, created_at, updated_at)
VALUES (
  'analytics',
  'Text Analytics',
  'Text Analytics and Sentiment Analysis',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Get the analytics module ID for use in subsequent inserts
DO $$
DECLARE
    analytics_module_id TEXT;
    role_record RECORD;
BEGIN
    -- Get module name (since modules table uses text for id in role_modules)
    SELECT name INTO analytics_module_id FROM modules WHERE name = 'analytics';
    
    -- Add analytics module to role_modules for specified roles (only if they exist)
    FOR role_record IN 
        SELECT id, name FROM roles 
        WHERE name IN ('Admin', 'Administrator', 'HR Manager', 'Properties Manager', 'Tenants', 'Transport Manager')
    LOOP
        INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
        VALUES (role_record.id, analytics_module_id, NOW(), NOW())
        ON CONFLICT (role_id, module_id) DO NOTHING;
        
        RAISE NOTICE 'Added analytics module to role: %', role_record.name;
    END LOOP;
    
    RAISE NOTICE 'Analytics module setup completed';
END $$;
