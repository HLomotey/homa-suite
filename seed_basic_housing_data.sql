-- Seed basic housing data for testing the housing report view

-- Insert sample properties if they don't exist
-- First check if properties table exists and what columns it has
INSERT INTO properties (id, title, address, status, rent_amount)
SELECT 
    gen_random_uuid(),
    'Sample Property ' || generate_series,
    '123 Main St #' || generate_series,
    'active',
    1200.00 + (generate_series * 100)
FROM generate_series(1, 3)
WHERE NOT EXISTS (SELECT 1 FROM properties LIMIT 1);

-- Insert sample rooms for each property
INSERT INTO rooms (id, property_id, name, capacity, status)
SELECT 
    gen_random_uuid(),
    p.id,
    'Room ' || row_number() OVER (PARTITION BY p.id),
    2,
    'available'
FROM properties p
CROSS JOIN generate_series(1, 2)
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE property_id = p.id);

-- Insert sample external staff if they don't exist
INSERT INTO external_staff (id, "PAYROLL FIRST NAME", "PAYROLL LAST NAME", "LOCATION", "HIRE DATE")
SELECT 
    gen_random_uuid(),
    'John' || generate_series,
    'Doe' || generate_series,
    CASE 
        WHEN generate_series % 3 = 1 THEN 'California'
        WHEN generate_series % 3 = 2 THEN 'Texas'
        ELSE 'Florida'
    END,
    CURRENT_DATE - INTERVAL '30 days'
FROM generate_series(1, 5)
WHERE NOT EXISTS (SELECT 1 FROM external_staff LIMIT 1);

-- Insert sample assignments
INSERT INTO assignments (
    id, 
    tenant_id, 
    property_id, 
    room_id, 
    tenant_name,
    property_name,
    room_name,
    status, 
    start_date, 
    rent_amount,
    housing_agreement,
    transportation_agreement
)
SELECT 
    gen_random_uuid(),
    es.id,
    p.id,
    r.id,
    COALESCE(es."PAYROLL FIRST NAME", 'Unknown') || ' ' || COALESCE(es."PAYROLL LAST NAME", 'Tenant'),
    p.title,
    r.name,
    CASE 
        WHEN row_number() OVER () % 3 = 1 THEN 'Active'
        WHEN row_number() OVER () % 3 = 2 THEN 'Pending'
        ELSE 'Inactive'
    END,
    CURRENT_DATE - INTERVAL '15 days',
    p.rent_amount,
    true,
    false
FROM properties p
CROSS JOIN rooms r
CROSS JOIN external_staff es
WHERE r.property_id = p.id
    AND NOT EXISTS (
        SELECT 1 FROM assignments a 
        WHERE a.property_id = p.id 
        AND a.room_id = r.id 
        AND a.tenant_id = es.id
    )
LIMIT 10;

-- Insert sample billing data
INSERT INTO billing (
    id,
    property_id,
    staff_id,
    rent_amount,
    period_start,
    period_end,
    billing_type
)
SELECT 
    gen_random_uuid(),
    a.property_id,
    a.tenant_id,
    a.rent_amount,
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
    'housing'
FROM assignments a
WHERE a.status = 'Active'
    AND NOT EXISTS (
        SELECT 1 FROM billing b 
        WHERE b.property_id = a.property_id 
        AND b.staff_id = a.tenant_id
        AND b.billing_type = 'housing'
    );

-- Verify the data was inserted
SELECT 
    'properties' as table_name, 
    COUNT(*) as row_count 
FROM properties
UNION ALL
SELECT 
    'rooms' as table_name, 
    COUNT(*) as row_count 
FROM rooms
UNION ALL
SELECT 
    'external_staff' as table_name, 
    COUNT(*) as row_count 
FROM external_staff
UNION ALL
SELECT 
    'assignments' as table_name, 
    COUNT(*) as row_count 
FROM assignments
UNION ALL
SELECT 
    'billing' as table_name, 
    COUNT(*) as row_count 
FROM billing;