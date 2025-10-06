-- Simple UPDATE statements to populate assignment amounts
-- Created: 2025-10-05

-- Update transportation agreements and set amount to $25
UPDATE assignments 
SET transportation_agreement = true,
    transport_amount = 25.00
WHERE staff_id IS NOT NULL 
  AND status = 'Active'
  AND id IN (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL AND status = 'Active' 
    LIMIT 10
  );

-- Update bus card agreements and set amount to $50
UPDATE assignments 
SET bus_card_agreement = true,
    bus_card_amount = 50.00
WHERE staff_id IS NOT NULL 
  AND status = 'Active'
  AND transportation_agreement = false
  AND id IN (
    SELECT id FROM assignments 
    WHERE staff_id IS NOT NULL 
      AND status = 'Active' 
      AND transportation_agreement = false 
    LIMIT 5
  );

-- Update housing agreements and set deposit amount equal to rent
UPDATE assignments 
SET housing_agreement = true,
    rent_deposit_amount = rent_amount
WHERE rent_amount > 0 
  AND status = 'Active';

-- Verify the updates
SELECT 
    tenant_name,
    rent_amount,
    transportation_agreement,
    transport_amount,
    bus_card_agreement,
    bus_card_amount,
    housing_agreement,
    rent_deposit_amount
FROM assignments 
WHERE status = 'Active'
  AND (transportation_agreement = true OR bus_card_agreement = true OR rent_deposit_amount IS NOT NULL)
ORDER BY tenant_name;
