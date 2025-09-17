-- Set default amounts for benefit agreements
-- Created: 2025-09-17
-- Housing deposit: $500, Bus Card: $25

-- Update existing security deposits table to include default amounts
ALTER TABLE security_deposits 
ADD COLUMN IF NOT EXISTS default_amount DECIMAL(10,2);

-- Set default amounts based on benefit type
UPDATE security_deposits 
SET default_amount = CASE 
    WHEN benefit_type = 'housing' THEN 500.00
    WHEN benefit_type = 'bus_card' THEN 25.00
    WHEN benefit_type = 'transportation' THEN 25.00  -- Variable amount
    WHEN benefit_type = 'flight_agreement' THEN 0.00  -- Variable amount
    ELSE 0.00
END
WHERE default_amount IS NULL;

-- Add constraint to ensure default amounts are non-negative
ALTER TABLE security_deposits 
ADD CONSTRAINT check_default_amount_non_negative 
CHECK (default_amount >= 0);

-- Create function to get default amount for benefit type
CREATE OR REPLACE FUNCTION get_default_benefit_amount(benefit_type_param TEXT)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN CASE 
        WHEN benefit_type_param = 'housing' THEN 500.00
        WHEN benefit_type_param = 'bus_card' THEN 25.00
        WHEN benefit_type_param = 'transportation' THEN 0.00
        WHEN benefit_type_param = 'flight_agreement' THEN 0.00
        ELSE 0.00
    END;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION get_default_benefit_amount(TEXT) IS 'Returns default amount for benefit type: housing=$500, bus_card=$25, others=variable';
COMMENT ON COLUMN security_deposits.default_amount IS 'Default amount for this benefit type: housing=$500, bus_card=$25';