-- Migration: Extend security deposits to support all benefit types
-- Date: 2025-09-11
-- Description: Add benefit_type column to security_deposits table to support transportation, flight, and bus card deposits

-- Add benefit_type column to security_deposits table
ALTER TABLE security_deposits 
ADD COLUMN benefit_type benefit_type NOT NULL DEFAULT 'housing';

-- Update the existing constraint to allow multiple deposits per assignment (one per benefit type)
ALTER TABLE security_deposits 
DROP CONSTRAINT IF EXISTS security_deposits_assignment_id_key;

-- Add new unique constraint for assignment_id + benefit_type combination
ALTER TABLE security_deposits 
ADD CONSTRAINT security_deposits_assignment_benefit_unique 
UNIQUE (assignment_id, benefit_type);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_security_deposits_assignment_benefit 
ON security_deposits (assignment_id, benefit_type);

-- Update the trigger function to handle benefit types
CREATE OR REPLACE FUNCTION create_security_deposit_deductions()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create deduction schedule for deposits with amounts > 0
    IF NEW.total_amount > 0 THEN
        -- Insert 4 bi-weekly deduction records
        INSERT INTO security_deposit_deductions (
            security_deposit_id,
            deduction_number,
            scheduled_date,
            amount,
            status
        )
        SELECT 
            NEW.id,
            generate_series(1, 4) as deduction_number,
            (SELECT start_date FROM assignments WHERE id = NEW.assignment_id) + 
                (generate_series(1, 4) * INTERVAL '14 days') as scheduled_date,
            NEW.total_amount / 4.0 as amount,
            'scheduled'::deduction_status as status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment to document the benefit type support
COMMENT ON COLUMN security_deposits.benefit_type IS 'Type of benefit this security deposit is associated with (housing, transportation, flight_agreement, bus_card)';

-- Add RLS policy updates to handle benefit types
DROP POLICY IF EXISTS "Users can view security deposits for their assignments" ON security_deposits;
CREATE POLICY "Users can view security deposits for their assignments" ON security_deposits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = security_deposits.assignment_id
        )
    );

DROP POLICY IF EXISTS "Users can insert security deposits for their assignments" ON security_deposits;
CREATE POLICY "Users can insert security deposits for their assignments" ON security_deposits
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = security_deposits.assignment_id
        )
    );

DROP POLICY IF EXISTS "Users can update security deposits for their assignments" ON security_deposits;
CREATE POLICY "Users can update security deposits for their assignments" ON security_deposits
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = security_deposits.assignment_id
        )
    );

DROP POLICY IF EXISTS "Users can delete security deposits for their assignments" ON security_deposits;
CREATE POLICY "Users can delete security deposits for their assignments" ON security_deposits
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = security_deposits.assignment_id
        )
    );
