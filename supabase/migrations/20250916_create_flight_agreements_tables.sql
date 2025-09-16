-- Create flight agreements and deductions tables
-- Created: 2025-09-16

-- Create flight agreement status enum
CREATE TYPE flight_agreement_status AS ENUM ('Active', 'Completed', 'Cancelled', 'Suspended');

-- Create deduction status enum  
CREATE TYPE deduction_status AS ENUM ('Pending', 'Processed', 'Failed', 'Cancelled');

-- Create flight_agreements table
CREATE TABLE flight_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(50) NOT NULL, -- References external_staff ASSOCIATE ID
    staff_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    job_title VARCHAR(255),
    agreement_amount DECIMAL(10,2) NOT NULL CHECK (agreement_amount > 0),
    deduction_amount DECIMAL(10,2) NOT NULL CHECK (deduction_amount > 0),
    total_deductions INTEGER NOT NULL DEFAULT 3 CHECK (total_deductions > 0),
    processed_deductions INTEGER NOT NULL DEFAULT 0 CHECK (processed_deductions >= 0),
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    completion_date TIMESTAMPTZ,
    status flight_agreement_status NOT NULL DEFAULT 'Active',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_processed_deductions CHECK (processed_deductions <= total_deductions),
    CONSTRAINT completion_date_logic CHECK (
        (status = 'Completed' AND completion_date IS NOT NULL) OR 
        (status != 'Completed' AND completion_date IS NULL)
    )
);

-- Create flight_agreement_deductions table
CREATE TABLE flight_agreement_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES flight_agreements(id) ON DELETE CASCADE,
    deduction_sequence INTEGER NOT NULL CHECK (deduction_sequence > 0),
    payroll_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    deduction_date DATE NOT NULL,
    scheduled_amount DECIMAL(10,2) NOT NULL CHECK (scheduled_amount > 0),
    actual_amount DECIMAL(10,2),
    status deduction_status NOT NULL DEFAULT 'Pending',
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id),
    payroll_reference VARCHAR(100), -- Reference to payroll system
    failure_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    UNIQUE(agreement_id, deduction_sequence),
    CONSTRAINT valid_actual_amount CHECK (
        (status = 'Processed' AND actual_amount IS NOT NULL) OR 
        (status != 'Processed')
    ),
    CONSTRAINT valid_processed_fields CHECK (
        (status = 'Processed' AND processed_at IS NOT NULL AND processed_by IS NOT NULL) OR 
        (status != 'Processed')
    )
);

-- Create indexes for performance
CREATE INDEX idx_flight_agreements_staff_id ON flight_agreements(staff_id);
CREATE INDEX idx_flight_agreements_status ON flight_agreements(status);
CREATE INDEX idx_flight_agreements_start_date ON flight_agreements(start_date);
CREATE INDEX idx_flight_agreements_created_by ON flight_agreements(created_by);

CREATE INDEX idx_flight_deductions_agreement_id ON flight_agreement_deductions(agreement_id);
CREATE INDEX idx_flight_deductions_status ON flight_agreement_deductions(status);
CREATE INDEX idx_flight_deductions_deduction_date ON flight_agreement_deductions(deduction_date);
CREATE INDEX idx_flight_deductions_payroll_period ON flight_agreement_deductions(payroll_period);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_flight_agreements_updated_at 
    BEFORE UPDATE ON flight_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_deductions_updated_at 
    BEFORE UPDATE ON flight_agreement_deductions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE flight_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_agreement_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view flight agreements" ON flight_agreements
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create flight agreements" ON flight_agreements
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update flight agreements" ON flight_agreements
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete flight agreements" ON flight_agreements
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view flight deductions" ON flight_agreement_deductions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create flight deductions" ON flight_agreement_deductions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update flight deductions" ON flight_agreement_deductions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete flight deductions" ON flight_agreement_deductions
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create function to automatically update agreement status based on deductions
CREATE OR REPLACE FUNCTION update_flight_agreement_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the agreement's processed_deductions count and status
    UPDATE flight_agreements 
    SET 
        processed_deductions = (
            SELECT COUNT(*) 
            FROM flight_agreement_deductions 
            WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
        ),
        status = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM flight_agreement_deductions 
                WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM flight_agreements 
                WHERE id = NEW.agreement_id
            ) THEN 'Completed'::flight_agreement_status
            ELSE status
        END,
        completion_date = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM flight_agreement_deductions 
                WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM flight_agreements 
                WHERE id = NEW.agreement_id
            ) THEN now()
            ELSE completion_date
        END
    WHERE id = NEW.agreement_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update agreement status when deductions are processed
CREATE TRIGGER update_agreement_status_on_deduction_change
    AFTER UPDATE OF status ON flight_agreement_deductions
    FOR EACH ROW 
    WHEN (NEW.status = 'Processed' AND OLD.status != 'Processed')
    EXECUTE FUNCTION update_flight_agreement_status();

-- Create view for flight agreement summary
CREATE VIEW flight_agreements_summary AS
SELECT 
    fa.id,
    fa.staff_id,
    fa.staff_name,
    fa.department,
    fa.job_title,
    fa.agreement_amount,
    fa.deduction_amount,
    fa.total_deductions,
    fa.processed_deductions,
    fa.start_date,
    fa.completion_date,
    fa.status,
    fa.created_at,
    fa.updated_at,
    COALESCE(SUM(fad.actual_amount), 0) as total_deducted,
    fa.agreement_amount - COALESCE(SUM(fad.actual_amount), 0) as remaining_balance,
    COUNT(fad.id) FILTER (WHERE fad.status = 'Pending') as pending_deductions,
    COUNT(fad.id) FILTER (WHERE fad.status = 'Failed') as failed_deductions,
    MIN(fad.deduction_date) FILTER (WHERE fad.status = 'Pending') as next_deduction_date
FROM flight_agreements fa
LEFT JOIN flight_agreement_deductions fad ON fa.id = fad.agreement_id
GROUP BY fa.id, fa.staff_id, fa.staff_name, fa.department, fa.job_title, 
         fa.agreement_amount, fa.deduction_amount, fa.total_deductions, 
         fa.processed_deductions, fa.start_date, fa.completion_date, 
         fa.status, fa.created_at, fa.updated_at;

-- Grant permissions on the view
GRANT SELECT ON flight_agreements_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE flight_agreements IS 'Flight purchase agreements with staff members';
COMMENT ON TABLE flight_agreement_deductions IS 'Scheduled payroll deductions for flight agreements';
COMMENT ON VIEW flight_agreements_summary IS 'Summary view of flight agreements with deduction statistics';

COMMENT ON COLUMN flight_agreements.staff_id IS 'References external_staff ASSOCIATE ID';
COMMENT ON COLUMN flight_agreements.total_deductions IS 'Total number of deductions planned (default 3)';
COMMENT ON COLUMN flight_agreements.processed_deductions IS 'Number of deductions successfully processed';
COMMENT ON COLUMN flight_agreement_deductions.deduction_sequence IS 'Order of deduction (1, 2, 3, etc.)';
COMMENT ON COLUMN flight_agreement_deductions.payroll_period IS 'Payroll period in YYYY-MM format';
COMMENT ON COLUMN flight_agreement_deductions.scheduled_amount IS 'Originally scheduled deduction amount';
COMMENT ON COLUMN flight_agreement_deductions.actual_amount IS 'Actual amount deducted (may differ due to adjustments)';
