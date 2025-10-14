-- Test script to verify the migration results
-- Run this after the main migration to check results

-- Check if new roles were created
SELECT 'Roles Created:' as section;
SELECT name, display_name, sort_order 
FROM roles 
WHERE name IN ('HR Manager', 'Properties Manager', 'Transport Manager', 'Finance Manager')
ORDER BY sort_order;

-- Check module count
SELECT 'Total Modules:' as section;
SELECT COUNT(*) as total_modules FROM modules;

-- Check role-module assignments for HR Manager
SELECT 'HR Manager Modules:' as section;
SELECT COUNT(*) as module_count 
FROM role_modules rm 
JOIN roles r ON rm.role_id = r.id 
WHERE r.name = 'HR Manager';

-- List HR Manager modules
SELECT 'HR Manager Module List:' as section;
SELECT rm.module_id 
FROM role_modules rm 
JOIN roles r ON rm.role_id = r.id 
WHERE r.name = 'HR Manager'
ORDER BY rm.module_id;

-- Check permissions count for HR Manager
SELECT 'HR Manager Permissions:' as section;
SELECT COUNT(*) as permission_count 
FROM role_permissions rp 
JOIN roles r ON rp.role_id = r.id 
WHERE r.name = 'HR Manager';

-- Summary of all manager roles and their module counts
SELECT 'Manager Role Summary:' as section;
SELECT 
    r.name as role_name,
    r.display_name,
    COUNT(rm.module_id) as module_count
FROM roles r
LEFT JOIN role_modules rm ON r.id = rm.role_id
WHERE r.name LIKE '%Manager%' OR r.name = 'admin' OR r.name = 'manager'
GROUP BY r.id, r.name, r.display_name
ORDER BY module_count DESC;
