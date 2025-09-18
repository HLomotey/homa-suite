-- Create transportation agreements and deductions tables
-- Created: 2025-09-17

-- Create transportation agreement status enum
CREATE TYPE transportation_agreement_status AS ENUM ('Active', 'Completed', 'Cancelled', 'Suspended');

-- Create transportation_agreements table
CREATE TABLE transportation_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id VARCHAR(50) NOT NULL, -- References external_staff ASSOCIATE ID
    staff_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    job_title VARCHAR(255),
    agreement_amount DECIMAL(10,2) NOT NULL CHECK (agreement_amount > 0),
    deduction_amount DECIMAL(10,2) NOT NULL CHECK (deduction_amount > 0),
    total_deductions INTEGER NOT NULL DEFAULT 4 CHECK (total_deductions > 0),
    processed_deductions INTEGER NOT NULL DEFAULT 0 CHECK (processed_deductions >= 0),
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    completion_date TIMESTAMPTZ,
    status transportation_agreement_status NOT NULL DEFAULT 'Active',
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

-- Create transportation_agreement_deductions table
CREATE TABLE transportation_agreement_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES transportation_agreements(id) ON DELETE CASCADE,
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
CREATE INDEX idx_transportation_agreements_staff_id ON transportation_agreements(staff_id);
CREATE INDEX idx_transportation_agreements_status ON transportation_agreements(status);
CREATE INDEX idx_transportation_agreements_start_date ON transportation_agreements(start_date);
CREATE INDEX idx_transportation_agreements_created_by ON transportation_agreements(created_by);

CREATE INDEX idx_transportation_deductions_agreement_id ON transportation_agreement_deductions(agreement_id);
CREATE INDEX idx_transportation_deductions_status ON transportation_agreement_deductions(status);
CREATE INDEX idx_transportation_deductions_deduction_date ON transportation_agreement_deductions(deduction_date);
CREATE INDEX idx_transportation_deductions_payroll_period ON transportation_agreement_deductions(payroll_period);

-- Create triggers for updated_at
CREATE TRIGGER update_transportation_agreements_updated_at 
    BEFORE UPDATE ON transportation_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transportation_deductions_updated_at 
    BEFORE UPDATE ON transportation_agreement_deductions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE transportation_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_agreement_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view transportation agreements" ON transportation_agreements
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create transportation agreements" ON transportation_agreements
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update transportation agreements" ON transportation_agreements
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete transportation agreements" ON transportation_agreements
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view transportation deductions" ON transportation_agreement_deductions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create transportation deductions" ON transportation_agreement_deductions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update transportation deductions" ON transportation_agreement_deductions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete transportation deductions" ON transportation_agreement_deductions
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create function to automatically update agreement status based on deductions
CREATE OR REPLACE FUNCTION update_transportation_agreement_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the agreement's processed_deductions count and status
    UPDATE transportation_agreements 
    SET 
        processed_deductions = (
            SELECT COUNT(*) 
            FROM transportation_agreement_deductions 
            WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
        ),
        status = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM transportation_agreement_deductions 
                WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM transportation_agreements 
                WHERE id = NEW.agreement_id
            ) THEN 'Completed'::transportation_agreement_status
            ELSE status
        END,
        completion_date = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM transportation_agreement_deductions 
                WHERE agreement_id = NEW.agreement_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM transportation_agreements 
                WHERE id = NEW.agreement_id
            ) THEN now()
            ELSE completion_date
        END
    WHERE id = NEW.agreement_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update agreement status when deductions are processed
CREATE TRIGGER update_transportation_agreement_status_on_deduction_change
    AFTER UPDATE OF status ON transportation_agreement_deductions
    FOR EACH ROW 
    WHEN (NEW.status = 'Processed' AND OLD.status != 'Processed')
    EXECUTE FUNCTION update_transportation_agreement_status();

-- Create view for transportation agreement summary
CREATE VIEW transportation_agreements_summary AS
SELECT 
    ta.id,
    ta.staff_id,
    ta.staff_name,
    ta.department,
    ta.job_title,
    ta.agreement_amount,
    ta.deduction_amount,
    ta.total_deductions,
    ta.processed_deductions,
    ta.start_date,
    ta.completion_date,
    ta.status,
    ta.created_at,
    ta.updated_at,
    COALESCE(SUM(tad.actual_amount), 0) as total_deducted,
    ta.agreement_amount - COALESCE(SUM(tad.actual_amount), 0) as remaining_balance,
    COUNT(tad.id) FILTER (WHERE tad.status = 'Pending') as pending_deductions,
    COUNT(tad.id) FILTER (WHERE tad.status = 'Failed') as failed_deductions,
    MIN(tad.deduction_date) FILTER (WHERE tad.status = 'Pending') as next_deduction_date
FROM transportation_agreements ta
LEFT JOIN transportation_agreement_deductions tad ON ta.id = tad.agreement_id
GROUP BY ta.id, ta.staff_id, ta.staff_name, ta.department, ta.job_title, 
         ta.agreement_amount, ta.deduction_amount, ta.total_deductions, 
         ta.processed_deductions, ta.start_date, ta.completion_date, 
         ta.status, ta.created_at, ta.updated_at;

-- Grant permissions on the view
GRANT SELECT ON transportation_agreements_summary TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE transportation_agreements IS 'Transportation agreements with staff members';
COMMENT ON TABLE transportation_agreement_deductions IS 'Scheduled payroll deductions for transportation agreements';
COMMENT ON VIEW transportation_agreements_summary IS 'Summary view of transportation agreements with deduction statistics';

COMMENT ON COLUMN transportation_agreements.staff_id IS 'References external_staff ASSOCIATE ID';
COMMENT ON COLUMN transportation_agreements.total_deductions IS 'Total number of deductions planned (default 4 bi-weekly)';
COMMENT ON COLUMN transportation_agreements.processed_deductions IS 'Number of deductions successfully processed';
COMMENT ON COLUMN transportation_agreement_deductions.deduction_sequence IS 'Order of deduction (1, 2, 3, 4, etc.)';
COMMENT ON COLUMN transportation_agreement_deductions.payroll_period IS 'Payroll period in YYYY-MM format';
COMMENT ON COLUMN transportation_agreement_deductions.scheduled_amount IS 'Originally scheduled deduction amount';
COMMENT ON COLUMN transportation_agreement_deductions.actual_amount IS 'Actual amount deducted (may differ due to adjustments)';