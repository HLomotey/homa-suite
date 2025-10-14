-- Update payroll_deductions table to match the new structure
-- Based on the user's image showing: Position ID, BCD_Bus Card_Deduction, HDD_Hang Dep Ded_Deduction, etc.

-- First, let's see what the current table structure looks like
-- and then update it to match the expected column names

-- Check if the table exists and what columns it has
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Check if payroll_deductions table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payroll_deductions') THEN
        RAISE NOTICE 'payroll_deductions table exists, proceeding with column updates';
        
        -- First, let's see what columns already exist
        RAISE NOTICE 'Existing columns in payroll_deductions:';
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'payroll_deductions'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (nullable: %, default: %)', rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
        END LOOP;
        
        -- Handle existing payroll_name column if it exists and is NOT NULL
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'payroll_name') THEN
            -- Check if it's NOT NULL
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'payroll_name' AND is_nullable = 'NO') THEN
                -- Make it nullable or drop the constraint
                ALTER TABLE payroll_deductions ALTER COLUMN payroll_name DROP NOT NULL;
                RAISE NOTICE 'Removed NOT NULL constraint from payroll_name column';
            END IF;
        END IF;
        
        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'position_id') THEN
            ALTER TABLE payroll_deductions ADD COLUMN position_id TEXT;
            RAISE NOTICE 'Added position_id column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'bcd_bus_card_deduction') THEN
            ALTER TABLE payroll_deductions ADD COLUMN bcd_bus_card_deduction DECIMAL(10,2) DEFAULT 0.00;
            RAISE NOTICE 'Added bcd_bus_card_deduction column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'hdd_hang_dep_ded_deduction') THEN
            ALTER TABLE payroll_deductions ADD COLUMN hdd_hang_dep_ded_deduction DECIMAL(10,2) DEFAULT 0.00;
            RAISE NOTICE 'Added hdd_hang_dep_ded_deduction column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'rnt_rent_deduction') THEN
            ALTER TABLE payroll_deductions ADD COLUMN rnt_rent_deduction DECIMAL(10,2) DEFAULT 0.00;
            RAISE NOTICE 'Added rnt_rent_deduction column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'trn_transport_subs_deduction') THEN
            ALTER TABLE payroll_deductions ADD COLUMN trn_transport_subs_deduction DECIMAL(10,2) DEFAULT 0.00;
            RAISE NOTICE 'Added trn_transport_subs_deduction column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'start_period') THEN
            ALTER TABLE payroll_deductions ADD COLUMN start_period DATE;
            RAISE NOTICE 'Added start_period column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payroll_deductions' AND column_name = 'end_period') THEN
            ALTER TABLE payroll_deductions ADD COLUMN end_period DATE;
            RAISE NOTICE 'Added end_period column';
        END IF;
        
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE payroll_deductions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            position_id TEXT NOT NULL,
            bcd_bus_card_deduction DECIMAL(10,2) DEFAULT 0.00,
            hdd_hang_dep_ded_deduction DECIMAL(10,2) DEFAULT 0.00,
            rnt_rent_deduction DECIMAL(10,2) DEFAULT 0.00,
            trn_transport_subs_deduction DECIMAL(10,2) DEFAULT 0.00,
            start_period DATE NOT NULL,
            end_period DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created payroll_deductions table with new structure';
    END IF;
END $$;

-- Add constraints and indexes
DO $$
BEGIN
    -- First, check if external_staff has duplicate POSITION IDs
    DECLARE
        duplicate_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO duplicate_count
        FROM (
            SELECT "POSITION ID", COUNT(*)
            FROM external_staff
            WHERE "POSITION ID" IS NOT NULL AND "POSITION ID" != ''
            GROUP BY "POSITION ID"
            HAVING COUNT(*) > 1
        ) duplicates;
        
        IF duplicate_count > 0 THEN
            RAISE NOTICE 'Found % duplicate POSITION IDs in external_staff. Cannot add unique constraint.', duplicate_count;
            RAISE NOTICE 'Skipping foreign key constraint creation due to duplicate POSITION IDs';
        ELSE
            -- Add unique constraint to external_staff POSITION ID column if no duplicates
            IF NOT EXISTS (
                SELECT FROM information_schema.table_constraints 
                WHERE table_name = 'external_staff' 
                AND constraint_type = 'UNIQUE'
                AND constraint_name = 'external_staff_position_id_unique'
            ) THEN
                ALTER TABLE external_staff 
                ADD CONSTRAINT external_staff_position_id_unique 
                UNIQUE ("POSITION ID");
                
                RAISE NOTICE 'Added unique constraint to external_staff POSITION ID';
            END IF;
            
            -- Now add foreign key constraint to payroll_deductions if it doesn't exist
            IF NOT EXISTS (
                SELECT FROM information_schema.table_constraints 
                WHERE table_name = 'payroll_deductions' 
                AND constraint_name = 'payroll_deductions_position_id_fkey'
            ) THEN
                ALTER TABLE payroll_deductions 
                ADD CONSTRAINT payroll_deductions_position_id_fkey 
                FOREIGN KEY (position_id) REFERENCES external_staff("POSITION ID");
                
                RAISE NOTICE 'Added foreign key constraint to external_staff';
            END IF;
        END IF;
    END;
    
    -- Add index on position_id for better performance
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'payroll_deductions' 
        AND indexname = 'idx_payroll_deductions_position_id'
    ) THEN
        CREATE INDEX idx_payroll_deductions_position_id ON payroll_deductions(position_id);
        RAISE NOTICE 'Added index on position_id';
    END IF;
    
    -- Add index on period dates for better query performance
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'payroll_deductions' 
        AND indexname = 'idx_payroll_deductions_periods'
    ) THEN
        CREATE INDEX idx_payroll_deductions_periods ON payroll_deductions(start_period, end_period);
        RAISE NOTICE 'Added index on period dates';
    END IF;
END $$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_payroll_deductions_updated_at ON payroll_deductions;
CREATE TRIGGER update_payroll_deductions_updated_at
    BEFORE UPDATE ON payroll_deductions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE payroll_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view payroll deductions" ON payroll_deductions;
CREATE POLICY "Users can view payroll deductions" ON payroll_deductions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert payroll deductions" ON payroll_deductions;
CREATE POLICY "Users can insert payroll deductions" ON payroll_deductions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update payroll deductions" ON payroll_deductions;
CREATE POLICY "Users can update payroll deductions" ON payroll_deductions
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete payroll deductions" ON payroll_deductions;
CREATE POLICY "Users can delete payroll deductions" ON payroll_deductions
    FOR DELETE USING (true);

-- Add comments for documentation
COMMENT ON TABLE payroll_deductions IS 'Payroll deductions for staff members with various deduction types';
COMMENT ON COLUMN payroll_deductions.position_id IS 'References external_staff POSITION ID field';
COMMENT ON COLUMN payroll_deductions.bcd_bus_card_deduction IS 'Bus card deduction amount';
COMMENT ON COLUMN payroll_deductions.hdd_hang_dep_ded_deduction IS 'Hang deposit deduction amount';
COMMENT ON COLUMN payroll_deductions.rnt_rent_deduction IS 'Rent deduction amount';
COMMENT ON COLUMN payroll_deductions.trn_transport_subs_deduction IS 'Transport subsidy deduction amount';
COMMENT ON COLUMN payroll_deductions.start_period IS 'Start date of deduction period';
COMMENT ON COLUMN payroll_deductions.end_period IS 'End date of deduction period';
