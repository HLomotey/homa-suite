-- Fix missing roles and ensure all modules are properly assigned
-- Created: 2025-09-24 (Simplified version)

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

-- Add HR Manager modules (18 modules for comprehensive access)
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'dashboard', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'hr', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'staff', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'payroll', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'attendance', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'onboarding', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'termination', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'properties', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'operations', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'billing', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'users', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'settings', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'notifications', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'activity-log', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'projections', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'complaints', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'job-orders', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'text-analytics', NOW(), NOW() FROM roles r WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Add similar modules for other manager roles (simplified - just key modules)
-- Properties Manager
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'dashboard', NOW(), NOW() FROM roles r WHERE r.name = 'Properties Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'properties', NOW(), NOW() FROM roles r WHERE r.name = 'Properties Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'maintenance', NOW(), NOW() FROM roles r WHERE r.name = 'Properties Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'billing', NOW(), NOW() FROM roles r WHERE r.name = 'Properties Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'complaints', NOW(), NOW() FROM roles r WHERE r.name = 'Properties Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Transport Manager
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'dashboard', NOW(), NOW() FROM roles r WHERE r.name = 'Transport Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'transport', NOW(), NOW() FROM roles r WHERE r.name = 'Transport Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'maintenance', NOW(), NOW() FROM roles r WHERE r.name = 'Transport Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- Finance Manager
INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'dashboard', NOW(), NOW() FROM roles r WHERE r.name = 'Finance Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'finance', NOW(), NOW() FROM roles r WHERE r.name = 'Finance Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'billing', NOW(), NOW() FROM roles r WHERE r.name = 'Finance Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'payroll', NOW(), NOW() FROM roles r WHERE r.name = 'Finance Manager'
ON CONFLICT (role_id, module_id) DO NOTHING;

INSERT INTO role_modules (role_id, module_id, created_at, updated_at)
SELECT r.id, 'projections', NOW(), NOW() FROM roles r WHERE r.name = 'Finance Manager'
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
