-- Add bus_card_agreement column to assignments table
ALTER TABLE assignments ADD COLUMN bus_card_agreement BOOLEAN DEFAULT FALSE;

-- Update table comment to reflect the new agreement field
COMMENT ON COLUMN assignments.bus_card_agreement IS 'Whether the tenant has agreed to bus card benefit terms and conditions';

-- Update existing assignments to have bus_card_agreement=FALSE (already handled by DEFAULT FALSE)
-- No need for explicit UPDATE statement as DEFAULT FALSE will handle existing rows
