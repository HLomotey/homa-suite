-- Migration to halve all existing rent amounts in billing table for biweekly calculation
-- This converts monthly rent amounts to biweekly amounts (monthly / 2)

BEGIN;

-- Update all existing billing records to halve the rent amount
UPDATE billing 
SET rent_amount = rent_amount / 2.0,
    updated_at = NOW()
WHERE rent_amount > 0;

-- Log the changes
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % billing records to use biweekly rent amounts (halved)', updated_count;
END $$;

COMMIT;
