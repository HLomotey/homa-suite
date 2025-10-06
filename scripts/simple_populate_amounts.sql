-- Simple Population Script for Assignment Amounts
-- Created: 2025-10-05
-- This script uses a simpler approach to avoid syntax errors

-- Step 1: Set security deposit amounts to $500 for all staff in housing
UPDATE assignments 
SET housing_agreement = true,
    rent_deposit_amount = 500.00
WHERE rent_amount > 0 
AND status = 'Active';

-- Step 2: Set transportation agreements for first 10 staff assignments
WITH transport_assignments AS (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL 
    AND staff_name IS NOT NULL
    AND status = 'Active'
    ORDER BY id
    LIMIT 10
)
UPDATE assignments 
SET transportation_agreement = true,
    transport_amount = 25.00
WHERE id IN (SELECT id FROM transport_assignments);

-- Step 3: Set bus card agreements for staff who don't have transport (next 8 assignments)
WITH bus_assignments AS (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL 
    AND staff_name IS NOT NULL
    AND status = 'Active'
    AND transportation_agreement IS NOT true
    ORDER BY id
    LIMIT 8
)
UPDATE assignments 
SET bus_card_agreement = true,
    bus_card_amount = 8.00
WHERE id IN (SELECT id FROM bus_assignments);

-- Step 4: Set flight agreements for remaining staff (next 3 assignments)
WITH flight_assignments AS (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL 
    AND status = 'Active'
    AND transportation_agreement IS NOT true
    AND bus_card_agreement IS NOT true
    ORDER BY id
    LIMIT 3
)
UPDATE assignments 
SET flight_agreement = true
WHERE id IN (SELECT id FROM flight_assignments);

-- Verification query to see the results
SELECT 
    'Summary' as type,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN transportation_agreement = true THEN 1 END) as transport_count,
    COUNT(CASE WHEN bus_card_agreement = true THEN 1 END) as bus_card_count,
    COUNT(CASE WHEN housing_agreement = true THEN 1 END) as housing_count,
    COUNT(CASE WHEN flight_agreement = true THEN 1 END) as flight_count
FROM assignments 
WHERE status = 'Active';

-- Show sample updated assignments
SELECT 
    tenant_name,
    property_name,
    rent_amount,
    transportation_agreement,
    transport_amount,
    bus_card_agreement,
    bus_card_amount,
    housing_agreement,
    rent_deposit_amount,
    flight_agreement
FROM assignments 
WHERE status = 'Active'
AND (transportation_agreement = true OR bus_card_agreement = true OR rent_deposit_amount IS NOT NULL)
ORDER BY tenant_name
LIMIT 15;
