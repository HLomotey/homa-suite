-- Add flight_agreement to the benefit_type enum
ALTER TYPE benefit_type ADD VALUE 'flight_agreement';

-- Update table comment to reflect the new benefit type
COMMENT ON COLUMN staff_benefits.benefit_type IS 'Type of benefit required: housing, transportation, or flight_agreement';
