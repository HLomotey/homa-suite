-- Update assignments table schema to add missing columns
-- This migration safely adds missing columns to preserve existing data

-- Add missing agreement columns if they don't exist
DO $$ 
BEGIN
    -- Add housing_agreement column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'housing_agreement'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE assignments ADD COLUMN housing_agreement boolean DEFAULT FALSE;
    END IF;

    -- Add transportation_agreement column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'transportation_agreement'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE assignments ADD COLUMN transportation_agreement boolean DEFAULT FALSE;
    END IF;

    -- Add flight_agreement column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'flight_agreement'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE assignments ADD COLUMN flight_agreement boolean DEFAULT FALSE;
    END IF;

    -- Add bus_card_agreement column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'bus_card_agreement'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE assignments ADD COLUMN bus_card_agreement boolean DEFAULT FALSE;
    END IF;

    -- Ensure property_id allows NULL values (remove NOT NULL constraint if it exists)
    BEGIN
        ALTER TABLE assignments ALTER COLUMN property_id DROP NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            -- Ignore error if constraint doesn't exist
            NULL;
    END;

    -- Ensure room_id allows NULL values (remove NOT NULL constraint if it exists)
    BEGIN
        ALTER TABLE assignments ALTER COLUMN room_id DROP NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            -- Ignore error if constraint doesn't exist
            NULL;
    END;

    -- Ensure start_date allows NULL values (remove NOT NULL constraint if it exists)
    BEGIN
        ALTER TABLE assignments ALTER COLUMN start_date DROP NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            -- Ignore error if constraint doesn't exist
            NULL;
    END;

END $$;

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_assignments_tenant_id ON assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_property_id ON assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_assignments_room_id ON assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_start_date ON assignments(start_date);
CREATE INDEX IF NOT EXISTS idx_assignments_end_date ON assignments(end_date);

-- Add comments for documentation
COMMENT ON TABLE assignments IS 'Staff room assignments and housing arrangements';
COMMENT ON COLUMN assignments.tenant_id IS 'Reference to external staff member assigned to the room';
COMMENT ON COLUMN assignments.tenant_name IS 'Cached name of the tenant for display purposes';
COMMENT ON COLUMN assignments.property_id IS 'Reference to the property (may be UUID or string)';
COMMENT ON COLUMN assignments.property_name IS 'Cached name of the property for display purposes';
COMMENT ON COLUMN assignments.room_id IS 'Reference to the room (may be UUID or string)';
COMMENT ON COLUMN assignments.room_name IS 'Cached name of the room for display purposes';
COMMENT ON COLUMN assignments.status IS 'Current status of the assignment';
COMMENT ON COLUMN assignments.start_date IS 'Date when the assignment begins';
COMMENT ON COLUMN assignments.end_date IS 'Date when the assignment ends (NULL for ongoing)';
COMMENT ON COLUMN assignments.rent_amount IS 'Monthly rent amount for this assignment';
COMMENT ON COLUMN assignments.housing_agreement IS 'Whether the tenant has agreed to housing benefit terms';
COMMENT ON COLUMN assignments.transportation_agreement IS 'Whether the tenant has agreed to transportation benefit terms';
COMMENT ON COLUMN assignments.flight_agreement IS 'Whether the tenant has agreed to flight agreement benefit terms';
COMMENT ON COLUMN assignments.bus_card_agreement IS 'Whether the tenant has agreed to bus card benefit terms and conditions';

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    -- Only create trigger if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'assignments_updated_at'
        AND event_object_table = 'assignments'
    ) THEN
        CREATE TRIGGER assignments_updated_at
            BEFORE UPDATE ON assignments
            FOR EACH ROW
            EXECUTE FUNCTION update_assignments_updated_at();
    END IF;
END $$;
