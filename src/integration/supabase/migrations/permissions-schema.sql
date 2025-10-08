-- Permissions System Database Schema
-- This schema creates a flexible, database-driven permissions system

-- 1. Modules table - defines all available modules in the application
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'dashboard', 'finance', 'hr'
  display_name VARCHAR(100) NOT NULL, -- e.g., 'Dashboard', 'Finance Management'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Actions table - defines all possible actions (view, edit, create, delete, etc.)
CREATE TABLE IF NOT EXISTS actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'view', 'edit', 'create', 'delete'
  display_name VARCHAR(50) NOT NULL, -- e.g., 'View', 'Edit', 'Create', 'Delete'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Permissions table - defines specific permissions (module + action combinations)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'dashboard:view', 'finance:edit'
  display_name VARCHAR(150) NOT NULL, -- e.g., 'View Dashboard', 'Edit Finance'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, action_id)
);

-- 4. Roles table - defines user roles with their base permissions
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'admin', 'manager', 'staff', 'guest'
  display_name VARCHAR(100) NOT NULL, -- e.g., 'Administrator', 'Manager', 'Staff Member'
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- true for built-in roles, false for custom roles
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Role permissions junction table - defines which permissions each role has
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID, -- Reference to user who granted this permission
  UNIQUE(role_id, permission_id)
);

-- 6. User custom permissions - allows overriding role permissions for specific users
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- References the users table
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL, -- true = granted, false = explicitly denied
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID, -- Reference to user who granted/denied this permission
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
  UNIQUE(user_id, permission_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions(module_id, action_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_modules_active ON modules(is_active);
CREATE INDEX IF NOT EXISTS idx_actions_active ON actions(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_active ON permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);

-- Insert default modules
INSERT INTO modules (name, display_name, description, sort_order) VALUES
('dashboard', 'Dashboard', 'Main dashboard and overview', 1),
('properties', 'Properties', 'Property management and housing', 2),
('transport', 'Transport', 'Transportation and logistics', 3),
('hr', 'Human Resources', 'HR management and recruitment', 4),
('finance', 'Finance', 'Financial management and reporting', 5),
('operations', 'Operations', 'Operations management', 6),
('staff', 'Staff', 'Staff management', 7),
('billing', 'Billing', 'Billing and invoicing', 8),
('users', 'User Management', 'User and role management', 9),
('uploads', 'Excel Uploads', 'File uploads and data import', 10),
('attendance', 'Attendance', 'Attendance tracking', 11),
('payroll', 'Payroll', 'Payroll management', 12),
('settings', 'Settings', 'System settings and configuration', 13)
ON CONFLICT (name) DO NOTHING;

-- Insert default actions
INSERT INTO actions (name, display_name, description, sort_order) VALUES
('view', 'View', 'View and read access', 1),
('edit', 'Edit', 'Edit and update access', 2),
('create', 'Create', 'Create new records', 3),
('delete', 'Delete', 'Delete records', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, display_name, description, is_system_role, sort_order) VALUES
('admin', 'Administrator', 'Full system access', true, 1),
('manager', 'Manager', 'Management level access', true, 2),
('staff', 'Staff Member', 'Standard staff access', true, 3),
('guest', 'Guest', 'Limited read-only access', true, 4)
ON CONFLICT (name) DO NOTHING;

-- Create permissions by combining modules and actions
INSERT INTO permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
  m.id,
  a.id,
  m.name || ':' || a.name,
  a.display_name || ' ' || m.display_name,
  'Permission to ' || LOWER(a.display_name) || ' ' || LOWER(m.display_name)
FROM modules m
CROSS JOIN actions a
WHERE m.is_active = true AND a.is_active = true
ON CONFLICT (permission_key) DO NOTHING;

-- Set up default role permissions
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin' AND p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager gets most permissions except sensitive ones
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'manager' 
  AND p.is_active = true
  AND p.permission_key IN (
    'dashboard:view',
    'properties:view', 'properties:edit',
    'transport:view', 'transport:edit',
    'hr:view', 'hr:edit',
    'finance:view',
    'operations:view', 'operations:edit',
    'staff:view', 'staff:edit',
    'billing:view',
    'users:view',
    'uploads:view', 'uploads:create',
    'attendance:view', 'attendance:edit',
    'payroll:view',
    'settings:view'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Staff gets basic view permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'staff' 
  AND p.is_active = true
  AND p.permission_key IN (
    'dashboard:view',
    'properties:view',
    'transport:view',
    'hr:view',
    'operations:view',
    'staff:view',
    'uploads:view',
    'attendance:view',
    'settings:view'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Guest gets minimal permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'guest' 
  AND p.is_active = true
  AND p.permission_key IN (
    'dashboard:view',
    'properties:view',
    'settings:view'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
