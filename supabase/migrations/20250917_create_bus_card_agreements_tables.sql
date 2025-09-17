-- Create bus card agreements and deductions tables
-- Created: 2025-09-17

-- Create bus card agreement status enum
CREATE TYPE bus_card_agreement_status AS ENUM ('Active', 'Completed', 'Cancelled', 'Suspended');

-- Create bus_card_agreements table
CREATE TABLE bus_card_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(50) NOT NULL, -- References external_staff ASSOCIATE ID
    staff_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    job_title VARCHAR(255),
    agreement_amount DECIMAL(10,2) NOT NULL DEFAULT 25.00 CHECK (agreement_amount > 0),
    deduction_amount DECIMAL(10,2) NOT NULL DEFAULT 25.00 CHECK (deduction_amount > 0),
    total_deductions INTEGER NOT NULL DEFAULT 1 CHECK (total_deductions > 0),
    processed_deductions INTEGER NOT NULL DEFAULT 0 CHECK (processed_deductions >= 0),
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    completion_date TIMESTAMPTZ,
    status bus_card_agreement_status NOT NULL DEFAULT 'Active',
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

-- Create bus_card_agreement_deductions table
CREATE TABLE bus_card_agreement_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES bus_card_agreements(id) ON DELETE CASCADE,
    deduction_sequence INTEGER NOT NULL CHECK (deduction_sequence > 0),
    payroll_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    deduction_date DATE NOT NULL,
    scheduled_amount DECIMAL(10,2) NOT NULL DEFAULT 25.00 CHECK (scheduled_amount > 0),
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
CREATE INDEX idx_bus_card_agreements_staff_id ON bus_card_agreements(staff_id);
CREATE INDEX idx_bus_card_agreements_status ON bus_card_agreements(status);
CREATE INDEX idx_bus_card_agreements_start_date ON bus_card_agreements(start_date);
CREATE INDEX idx_bus_card_agreements_created_by ON bus_card_agreements(created_by);

CREATE INDEX idx_bus_card_deductions_agreement_id ON bus_card_agreement_deductions(agreement_id);
CREATE INDEX idx_bus_card_deductions_status ON bus_card_agreement_deductions(status);
CREATE INDEX idx_bus_card_deductions_deduction_date ON bus_card_agreement_deductions(deduction_date);
CREATE INDEX idx_bus_card_deductions_payroll_period ON bus_card_agreement_deductions(payroll_period);

-- Create triggers for updated_at
CREATE TRIGGER update_bus_card_agreements_updated_at 
    BEFORE UPDATE ON bus_card_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bus_card_deductions_updated_at 
    BEFORE UPDATE ON bus_card_agreement_deductions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE bus_card_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_card_agreement_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view bus card agreements" ON bus_card_agreements
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create bus card agreements" ON bus_card_agreements
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update bus card agreements" ON bus_card_agreements
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete bus card agreements" ON bus_card_agreements
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view bus card deductions" ON bus_card_agreement_deductions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create bus card deductions" ON bus_card_agreement_deductions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update bus card deductions" ON bus_card_agreement_deductions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete bus card deductions" ON bus_card_agreement_deductions
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create function to automatically update agreement status based on deductions
CREATE OR REPLACE FUNCTION update_bus_card_agreement_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the agreement's processed_deductions count and status
    UPDATE bus_card_agreements 
    SET 
        processed_deductions = (
            SELECT COUNT(*) 
            FROM bus_card_agreement_deductions 
            WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
        ),
        status = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM bus_card_agreement_deductions 
                WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM bus_card_agreements 
                WHERE id = NEW.agreement_id
            ) THEN 'Completed'::bus_card_agreement_status
            ELSE status
        END,
        completion_date = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM bus_card_agreement_deductions 
                WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM bus_card_agreements 
                WHERE id = NEW.agreement_id
            ) THEN now()
            ELSE completion_date
        END
    WHERE id = NEW.agreement_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update agreement status when deductions are processed
CREATE TRIGGER update_bus_card_agreement_status_on_deduction_change
    AFTER UPDATE OF status ON bus_card_agreement_deductions
    FOR EACH ROW 
    WHEN (NEW.status = 'Processed' AND OLD.status != 'Processed')
    EXECUTE FUNCTION update_bus_card_agreement_status();

-- Create view for bus card agreement summary
CREATE VIEW bus_card_agreements_summary AS
SELECT 
    bca.id,
    bca.staff_id,
    bca.staff_name,
    bca.department,
    bca.job_title,
    bca.agreement_amount,
    bca.deduction_amount,
    bca.total_deductions,
    bca.processed_deductions,
    bca.start_date,
    bca.completion_date,
    bca.status,
    bca.created_at,
    bca.updated_at,
    COALESCE(SUM(bcad.actual_amount), 0) as total_deducted,
    bca.agreement_amount - COALESCE(SUM(bcad.actual_amount), 0) as remaining_balance,
    COUNT(bcad.id) FILTER (WHERE bcad.status = 'Pending') as pending_deductions,
    COUNT(bcad.id) FILTER (WHERE bcad.status = 'Failed') as failed_deductions,
    MIN(bcad.deduction_date) FILTER (WHERE bcad.status = 'Pending') as next_deduction_date
FROM bus_card_agreements bca
LEFT JOIN bus_card_agreement_deductions bcad ON bca.id = bcad.agreement_id
GROUP BY bca.id, bca.staff_id, bca.staff_name, bca.department, bca.job_title, 
         bca.agreement_amount, bca.deduction_amount, bca.total_deductions, 
         bca.processed_deductions, bca.start_date, bca.completion_date, 
         bca.status, bca.created_at, bca.updated_at;

-- Grant permissions on the view
GRANT SELECT ON bus_card_agreements_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE bus_card_agreements IS 'Bus card agreements with staff members';
COMMENT ON TABLE bus_card_agreement_deductions IS 'Scheduled payroll deductions for bus card agreements';
COMMENT ON VIEW bus_card_agreements_summary IS 'Summary view of bus card agreements with deduction statistics';

COMMENT ON COLUMN bus_card_agreements.staff_id IS 'References external_staff ASSOCIATE ID';
COMMENT ON COLUMN bus_card_agreements.total_deductions IS 'Total number of deductions planned (default 1 for $25 bus card)';
COMMENT ON COLUMN bus_card_agreements.processed_deductions IS 'Number of deductions successfully processed';
COMMENT ON COLUMN bus_card_agreement_deductions.deduction_sequence IS 'Order of deduction (typically just 1 for bus card)';
COMMENT ON COLUMN bus_card_agreement_deductions.payroll_period IS 'Payroll period in YYYY-MM format';
COMMENT ON COLUMN bus_card_agreement_deductions.scheduled_amount IS 'Originally scheduled deduction amount ($25.00)';
COMMENT ON COLUMN bus_card_agreement_deductions.actual_amount IS 'Actual amount deducted (may differ due to adjustments)';