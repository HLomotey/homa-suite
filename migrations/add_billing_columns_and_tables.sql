-- Migration to add missing billing columns and tables
-- Created: 2025-10-05

-- Add missing columns to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS transportation_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transport_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS bus_card_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bus_card_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS housing_agreement BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS rent_deposit_amount DECIMAL(10,2);

-- Create billing_deductions table if it doesn't exist
CREATE TABLE IF NOT EXISTS billing_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    staff_name TEXT NOT NULL,
    billing_type TEXT NOT NULL CHECK (billing_type IN ('security_deposit', 'bus_card', 'flight_agreement')),
    deduction_sequence INTEGER NOT NULL,
    payroll_period TEXT NOT NULL,
    deduction_date DATE NOT NULL,
    scheduled_amount DECIMAL(10,2) NOT NULL,
    actual_amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
    processed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flight_agreement_deductions table if it doesn't exist
CREATE TABLE IF NOT EXISTS flight_agreement_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    staff_name TEXT NOT NULL,
    deduction_sequence INTEGER NOT NULL,
    payroll_period TEXT NOT NULL,
    deduction_date DATE NOT NULL,
    scheduled_amount DECIMAL(10,2) NOT NULL,
    actual_amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
    processed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flight_agreements table if it doesn't exist
CREATE TABLE IF NOT EXISTS flight_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    staff_name TEXT NOT NULL,
    department TEXT,
    job_title TEXT,
    agreement_amount DECIMAL(10,2) NOT NULL,
    deduction_amount DECIMAL(10,2) NOT NULL,
    total_deductions INTEGER NOT NULL DEFAULT 3,
    deductions_completed INTEGER DEFAULT 0,
    remaining_balance DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    completion_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'pending')),
    notes TEXT,
    created_by UUID,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_billing_deductions_staff_id ON billing_deductions(staff_id);
CREATE INDEX IF NOT EXISTS idx_billing_deductions_status ON billing_deductions(status);
CREATE INDEX IF NOT EXISTS idx_billing_deductions_type ON billing_deductions(billing_type);
CREATE INDEX IF NOT EXISTS idx_billing_deductions_date ON billing_deductions(deduction_date);

CREATE INDEX IF NOT EXISTS idx_flight_deductions_agreement_id ON flight_agreement_deductions(agreement_id);
CREATE INDEX IF NOT EXISTS idx_flight_deductions_status ON flight_agreement_deductions(status);
CREATE INDEX IF NOT EXISTS idx_flight_deductions_date ON flight_agreement_deductions(deduction_date);

CREATE INDEX IF NOT EXISTS idx_flight_agreements_staff_id ON flight_agreements(staff_id);
CREATE INDEX IF NOT EXISTS idx_flight_agreements_status ON flight_agreements(status);

CREATE INDEX IF NOT EXISTS idx_assignments_transport_agreement ON assignments(transportation_agreement);
CREATE INDEX IF NOT EXISTS idx_assignments_bus_agreement ON assignments(bus_card_agreement);
CREATE INDEX IF NOT EXISTS idx_assignments_housing_agreement ON assignments(housing_agreement);

-- Add RLS policies for billing_deductions
ALTER TABLE billing_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view billing deductions" ON billing_deductions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert billing deductions" ON billing_deductions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update billing deductions" ON billing_deductions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete billing deductions" ON billing_deductions
    FOR DELETE USING (true);

-- Add RLS policies for flight_agreement_deductions
ALTER TABLE flight_agreement_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flight deductions" ON flight_agreement_deductions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert flight deductions" ON flight_agreement_deductions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update flight deductions" ON flight_agreement_deductions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete flight deductions" ON flight_agreement_deductions
    FOR DELETE USING (true);

-- Add RLS policies for flight_agreements
ALTER TABLE flight_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flight agreements" ON flight_agreements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert flight agreements" ON flight_agreements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update flight agreements" ON flight_agreements
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete flight agreements" ON flight_agreements
    FOR DELETE USING (true);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_deductions_updated_at 
    BEFORE UPDATE ON billing_deductions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_deductions_updated_at 
    BEFORE UPDATE ON flight_agreement_deductions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_agreements_updated_at 
    BEFORE UPDATE ON flight_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing assignments to have housing_agreement = true where rent_amount exists
UPDATE assignments 
SET housing_agreement = true 
WHERE rent_amount IS NOT NULL AND rent_amount > 0;

-- Add some sample data to test the new columns (optional)
-- You can uncomment these if you want to add test data

-- UPDATE assignments 
-- SET transportation_agreement = true, transport_amount = 200.00 
-- WHERE id IN (SELECT id FROM assignments LIMIT 5);

-- UPDATE assignments 
-- SET bus_card_agreement = true, bus_card_amount = 50.00 
-- WHERE id IN (SELECT id FROM assignments LIMIT 3);

COMMENT ON TABLE billing_deductions IS 'Stores scheduled deductions for various billing types (security deposits, bus cards, etc.)';
COMMENT ON TABLE flight_agreement_deductions IS 'Stores scheduled deductions for flight agreements';
COMMENT ON TABLE flight_agreements IS 'Stores flight agreements with staff members';

COMMENT ON COLUMN assignments.transportation_agreement IS 'Whether staff member has transportation benefit agreement';
COMMENT ON COLUMN assignments.transport_amount IS 'Monthly transportation allowance amount';
COMMENT ON COLUMN assignments.bus_card_agreement IS 'Whether staff member has bus card benefit agreement';
COMMENT ON COLUMN assignments.bus_card_amount IS 'Bus card amount (one-time or periodic)';
COMMENT ON COLUMN assignments.housing_agreement IS 'Whether staff member has housing benefit agreement';
COMMENT ON COLUMN assignments.rent_deposit_amount IS 'Security deposit amount for housing';
