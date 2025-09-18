-- Add missing bus_card_agreement column to assignments table
-- Migration: 20250914_add_missing_bus_card_agreement_column.sql

-- Add bus_card_agreement column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'bus_card_agreement'
    ) THEN
        ALTER TABLE assignments ADD COLUMN bus_card_agreement BOOLEAN DEFAULT FALSE;
        
        -- Add comment for documentation
        COMMENT ON COLUMN assignments.bus_card_agreement IS 'Whether the tenant has agreed to bus card benefit terms and conditions';
    END IF;
END $$;
