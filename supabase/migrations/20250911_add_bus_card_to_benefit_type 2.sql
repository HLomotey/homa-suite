-- Add bus_card to the benefit_type enum
ALTER TYPE benefit_type ADD VALUE 'bus_card';

-- Update table comment to reflect the new benefit type
COMMENT ON COLUMN staff_benefits.benefit_type IS 'Type of benefit required: housing, transportation, flight_agreement, or bus_card';
