-- Fix missing roles and ensure all modules are properly assigned
-- Created: 2025-09-24

-- Create missing roles that are referenced in other migrations
INSERT INTO public.roles (name, display_name, description, is_system_role, sort_order) VALUES
('HR Manager', 'HR Manager', 'Human Resources Manager with full HR access', TRUE, 71),
('Properties Manager', 'Properties Manager', 'Property management with full property access', TRUE, 72),
('Transport Manager', 'Transport Manager', 'Transport management with full transport access', TRUE, 73),
('Finance Manager', 'Finance Manager', 'Finance manager with full financial access', TRUE, 74)
ON CONFLICT (name) DO NOTHING;

-- Ensure all modules exist (some may be missing from newer features)
INSERT INTO public.modules (name, display_name, description, sort_order) VALUES
('dashboard', 'Dashboard', 'Main dashboard and analytics', 10),
('properties', 'Properties', 'Property management', 20),
('transport', 'Transport', 'Transport management', 30),
('hr', 'Human Resources', 'HR management', 40),
('finance', 'Finance', 'Financial management', 50),
('operations', 'Operations', 'Operations management', 60),
('staff', 'Staff', 'Staff management', 70),
('billing', 'Billing', 'Billing and payments', 80),
('users', 'Users', 'User management', 90),
('uploads', 'Uploads', 'File uploads', 100),
('attendance', 'Attendance', 'Attendance tracking', 110),
('payroll', 'Payroll', 'Payroll management', 120),
('settings', 'Settings', 'System settings', 130),
('maintenance', 'Maintenance', 'Maintenance management', 140),
('job-orders', 'Job Orders', 'Job order tracking and management', 145),
('complaints', 'Complaints', 'Complaint management system', 150),
('projections', 'Projections', 'Financial projections and revenue forecasting', 155),
('termination', 'Termination', 'Employee termination requests and workflow management', 160),
('notifications', 'Notifications', 'Email notifications and templates management', 165),
('onboarding', 'Onboarding', 'Staff onboarding and benefits management', 170),
('activity-log', 'Activity Log', 'System activity monitoring and audit trails', 175),
('text-analytics', 'Text Analytics', 'Sentiment analysis and text insights', 180)
ON CONFLICT (name) DO NOTHING;

-- Generate permissions for any new modules (using simple INSERT with CROSS JOIN)
INSERT INTO public.permissions (module_id, action_id, permission_key, display_name, description)
SELECT 
    m.id, 
    a.id, 
    m.name || ':' || a.name, 
    m.display_name || ' - ' || a.display_name,
    'Permission to ' || a.display_name || ' in ' || m.display_name
FROM public.modules m
CROSS JOIN public.actions a
ON CONFLICT (module_id, action_id) DO NOTHING;

-- Assign comprehensive permissions to HR Manager role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE r.name = 'HR Manager'
AND m.name IN ('hr', 'staff', 'payroll', 'attendance', 'onboarding', 'termination')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE r.name = 'HR Manager'
AND m.name IN ('dashboard', 'properties', 'operations', 'billing', 'users', 'settings', 'notifications', 'activity-log', 'projections', 'complaints', 'job-orders')
AND a.name IN ('view', 'create', 'edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign comprehensive permissions to Properties Manager role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE r.name = 'Properties Manager'
AND m.name IN ('properties', 'maintenance', 'billing', 'complaints')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE r.name = 'Properties Manager'
AND m.name IN ('dashboard', 'operations', 'staff', 'users', 'settings', 'notifications', 'activity-log', 'projections', 'job-orders')
AND a.name IN ('view', 'create', 'edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign comprehensive permissions to Transport Manager role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE r.name = 'Transport Manager'
AND m.name IN ('transport', 'maintenance')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE r.name = 'Transport Manager'
AND m.name IN ('dashboard', 'operations', 'staff', 'users', 'settings', 'notifications', 'activity-log', 'job-orders')
AND a.name IN ('view', 'create', 'edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign comprehensive permissions to Finance Manager role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
WHERE r.name = 'Finance Manager'
AND m.name IN ('finance', 'billing', 'payroll', 'projections')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r
CROSS JOIN public.permissions p
JOIN public.modules m ON p.module_id = m.id
JOIN public.actions a ON p.action_id = a.id
WHERE r.name = 'Finance Manager'
AND m.name IN ('dashboard', 'operations', 'staff', 'users', 'settings', 'notifications', 'activity-log', 'job-orders')
AND a.name IN ('view', 'create', 'edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add all modules to role_modules for comprehensive navigation access
-- HR Manager gets access to all HR-related modules plus common ones
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, m.name, NOW(), NOW()
FROM roles r, modules m
WHERE r.name = 'HR Manager' 
AND m.name IN ('dashboard', 'hr', 'staff', 'payroll', 'attendance', 'onboarding', 'termination', 'properties', 'operations', 'billing', 'users', 'settings', 'notifications', 'activity-log', 'projections', 'complaints', 'job-orders', 'text-analytics')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Properties Manager gets access to property-related modules plus common ones
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, m.name, NOW(), NOW()
FROM roles r, modules m
WHERE r.name = 'Properties Manager' 
AND m.name IN ('dashboard', 'properties', 'maintenance', 'billing', 'complaints', 'operations', 'staff', 'users', 'settings', 'notifications', 'activity-log', 'projections', 'job-orders', 'text-analytics')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Transport Manager gets access to transport-related modules plus common ones
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, m.name, NOW(), NOW()
FROM roles r, modules m
WHERE r.name = 'Transport Manager' 
AND m.name IN ('dashboard', 'transport', 'maintenance', 'operations', 'staff', 'users', 'settings', 'notifications', 'activity-log', 'job-orders', 'text-analytics')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Finance Manager gets access to finance-related modules plus common ones
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, m.name, NOW(), NOW()
FROM roles r, modules m
WHERE r.name = 'Finance Manager' 
AND m.name IN ('dashboard', 'finance', 'billing', 'payroll', 'projections', 'operations', 'staff', 'users', 'settings', 'notifications', 'activity-log', 'job-orders', 'text-analytics')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Admin gets access to all modules
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, m.name, NOW(), NOW()
FROM roles r, modules m
WHERE r.name IN ('admin', 'Administrator')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Manager gets access to most modules
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, m.name, NOW(), NOW()
FROM roles r, modules m
WHERE r.name = 'manager' 
AND m.name IN ('dashboard', 'properties', 'operations', 'staff', 'billing', 'maintenance', 'complaints', 'job-orders', 'notifications', 'activity-log', 'projections', 'text-analytics')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- HR Officer gets access to HR modules
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, m.name, NOW(), NOW()
FROM roles r, modules m
WHERE r.name = 'hr_officer' 
AND m.name IN ('dashboard', 'hr', 'staff', 'payroll', 'attendance', 'onboarding', 'termination', 'notifications', 'activity-log', 'projections')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Verification query to show role-module assignments
SELECT 
    r.name as role_name,
    r.display_name,
    COUNT(rm.module_id) as module_count,
    STRING_AGG(rm.module_id, ', ' ORDER BY rm.module_id) as modules
FROM roles r
LEFT JOIN role_modules rm ON r.id = rm.role_id
WHERE r.name IN ('HR Manager', 'Properties Manager', 'Transport Manager', 'Finance Manager', 'admin', 'Administrator', 'manager', 'hr_officer')
GROUP BY r.id, r.name, r.display_name
ORDER BY r.name;
