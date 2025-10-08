-- Populate Assignment Amounts
-- Created: 2025-10-05
-- This script adds sample data to the existing assignment amount columns

-- Set transportation amount to $25 where staff uses transportation
-- First, let's enable transportation agreements for some assignments
UPDATE assignments 
SET transportation_agreement = true,
    transport_amount = 25.00
WHERE id IN (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL 
    AND staff_name IS NOT NULL
    AND status = 'Active'
    LIMIT 10
);

-- Set bus card amounts with $8 deduction for active assignments (excluding transport users)
UPDATE assignments 
SET bus_card_agreement = true,
    bus_card_amount = 8.00
WHERE id IN (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL 
    AND staff_name IS NOT NULL
    AND status = 'Active'
    AND (transportation_agreement = false OR transportation_agreement IS NULL)
    LIMIT 5
);

-- Set security deposit amounts based on rent amount (typically 1 month rent)
UPDATE assignments 
SET rent_deposit_amount = rent_amount,
    housing_agreement = true
WHERE rent_amount > 0
AND status = 'Active';

-- Set additional bus card agreements with $8 deduction for more assignments
UPDATE assignments 
SET bus_card_agreement = true,
    bus_card_amount = 8.00
WHERE id IN (
    SELECT id FROM assignments 
    WHERE rent_amount > 500
    AND bus_card_agreement = false
    AND status = 'Active'
    LIMIT 3
);

-- Set some flight agreements for staff (this will be used later)
UPDATE assignments 
SET flight_agreement = true
WHERE id IN (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL 
    AND status = 'Active'
    AND transportation_agreement = false
    AND bus_card_agreement = false
    LIMIT 3
);

-- Verify the updates
SELECT 
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN transportation_agreement = true THEN 1 END) as transport_agreements,
    COUNT(CASE WHEN bus_card_agreement = true THEN 1 END) as bus_card_agreements,
    COUNT(CASE WHEN housing_agreement = true THEN 1 END) as housing_agreements,
    COUNT(CASE WHEN flight_agreement = true THEN 1 END) as flight_agreements,
    AVG(transport_amount) as avg_transport_amount,
    AVG(bus_card_amount) as avg_bus_card_amount,
    AVG(rent_deposit_amount) as avg_deposit_amount
FROM assignments 
WHERE status = 'Active';

-- Show sample data
SELECT 
    tenant_name,
    property_name,
    room_name,
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
LIMIT 10;
