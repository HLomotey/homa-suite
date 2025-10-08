-- Add benefit agreement fields to assignments table
ALTER TABLE public.assignments 
ADD COLUMN housing_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN transportation_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN flight_agreement BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN assignments.housing_agreement IS 'Whether the tenant has agreed to housing benefit terms';
COMMENT ON COLUMN assignments.transportation_agreement IS 'Whether the tenant has agreed to transportation benefit terms';
COMMENT ON COLUMN assignments.flight_agreement IS 'Whether the tenant has agreed to flight agreement benefit terms';

-- No constraint needed - agreements are optional
-- Users can choose to opt out of all benefit agreements if desired
