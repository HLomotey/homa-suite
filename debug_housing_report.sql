-- Debug script to identify why housing_report_view is not producing data

-- 1. Check if the view exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'housing_report_view'
) as view_exists;

-- 2. Check if base tables have data
SELECT 'properties' as table_name, COUNT(*) as row_count FROM properties
UNION ALL
SELECT 'rooms' as table_name, COUNT(*) as row_count FROM rooms
UNION ALL
SELECT 'assignments' as table_name, COUNT(*) as row_count FROM assignments
UNION ALL
SELECT 'external_staff' as table_name, COUNT(*) as row_count FROM external_staff
UNION ALL
SELECT 'billing' as table_name, COUNT(*) as row_count FROM billing
UNION ALL
SELECT 'utility_setups' as table_name, COUNT(*) as row_count FROM utility_setups
UNION ALL
SELECT 'utility_types' as table_name, COUNT(*) as row_count FROM utility_types
UNION ALL
SELECT 'security_deposits' as table_name, COUNT(*) as row_count FROM security_deposits;

-- 3. Test the view query step by step
-- First, check basic properties data
SELECT 
    p.id,
    p.title,
    p.address,
    COUNT(r.id) as room_count
FROM properties p
LEFT JOIN rooms r ON r.property_id = p.id
GROUP BY p.id, p.title, p.address
LIMIT 5;

-- 4. Check if there are any active assignments
SELECT 
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_assignments,
    COUNT(CASE WHEN property_id IS NOT NULL THEN 1 END) as assignments_with_property
FROM assignments;

-- 5. Try a simplified version of the housing report view
SELECT 
    COALESCE(es."LOCATION", 'Unknown') as state,
    p.title as property,
    COUNT(r.id) as housing_capacity,
    COUNT(CASE WHEN a.status = 'Active' THEN 1 END) as housing_occupancy
FROM properties p
LEFT JOIN rooms r ON r.property_id = p.id
LEFT JOIN assignments a ON a.property_id = p.id
LEFT JOIN external_staff es ON es.id = a.tenant_id
WHERE (p.status = 'active' OR p.status IS NULL)
GROUP BY p.id, p.title, es."LOCATION"
LIMIT 10;