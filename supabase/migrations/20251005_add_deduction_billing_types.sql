-- Add security_deposit and bus_card billing types with deduction scheduling
-- This extends the billing system to support deduction-based billing like flight agreements

-- Create billing_type enum if it doesn't exist, then add new values
DO $$ 
BEGIN
  -- Create the enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_type') THEN
    CREATE TYPE billing_type AS ENUM ('housing', 'transportation');
  END IF;
  
  -- Add new values if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'security_deposit' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'billing_type')) THEN
    ALTER TYPE billing_type ADD VALUE 'security_deposit';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bus_card' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'billing_type')) THEN
    ALTER TYPE billing_type ADD VALUE 'bus_card';
  END IF;
END
$$;

-- Create deduction status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deduction_status') THEN
    CREATE TYPE deduction_status AS ENUM ('Pending', 'Processed', 'Failed', 'Cancelled');
  END IF;
END
$$;

-- Create billing_deductions table for deduction scheduling
CREATE TABLE IF NOT EXISTS billing_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_id UUID NOT NULL REFERENCES billing(id) ON DELETE CASCADE,
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
    UNIQUE(billing_id, deduction_sequence),
    CONSTRAINT valid_actual_amount CHECK (
        (status = 'Processed' AND actual_amount IS NOT NULL) OR 
        (status != 'Processed')
    ),
    CONSTRAINT valid_processed_fields CHECK (
        (status = 'Processed' AND processed_at IS NOT NULL AND processed_by IS NOT NULL) OR 
        (status != 'Processed')
    )
);

-- Add billing_type column if it doesn't exist (from previous migration)
ALTER TABLE billing 
ADD COLUMN IF NOT EXISTS billing_type billing_type NOT NULL DEFAULT 'housing';

-- Add deduction-related fields to billing table
ALTER TABLE billing 
ADD COLUMN IF NOT EXISTS total_deductions INTEGER DEFAULT 1 CHECK (total_deductions > 0),
ADD COLUMN IF NOT EXISTS processed_deductions INTEGER DEFAULT 0 CHECK (processed_deductions >= 0),
ADD COLUMN IF NOT EXISTS deduction_status VARCHAR(20) DEFAULT 'N/A' CHECK (deduction_status IN ('N/A', 'Active', 'Completed', 'Cancelled')),
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMPTZ;

-- Add constraint to ensure processed_deductions <= total_deductions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_processed_deductions' 
    AND table_name = 'billing'
  ) THEN
    ALTER TABLE billing 
    ADD CONSTRAINT valid_processed_deductions 
    CHECK (processed_deductions <= total_deductions);
  END IF;
END
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_deductions_billing_id ON billing_deductions(billing_id);
CREATE INDEX IF NOT EXISTS idx_billing_deductions_status ON billing_deductions(status);
CREATE INDEX IF NOT EXISTS idx_billing_deductions_deduction_date ON billing_deductions(deduction_date);
CREATE INDEX IF NOT EXISTS idx_billing_deductions_payroll_period ON billing_deductions(payroll_period);
CREATE INDEX IF NOT EXISTS idx_billing_billing_type ON billing(billing_type);
CREATE INDEX IF NOT EXISTS idx_billing_deduction_status ON billing(deduction_status);

-- Enable RLS on billing_deductions table
ALTER TABLE billing_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for billing_deductions
CREATE POLICY "Users can view billing deductions" ON billing_deductions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create billing deductions" ON billing_deductions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update billing deductions" ON billing_deductions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete billing deductions" ON billing_deductions
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at on billing_deductions
CREATE TRIGGER billing_deductions_updated_at
    BEFORE UPDATE ON billing_deductions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update billing deduction status
CREATE OR REPLACE FUNCTION update_billing_deduction_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the billing record's processed_deductions count and status
    UPDATE billing 
    SET 
        processed_deductions = (
            SELECT COUNT(*) 
            FROM billing_deductions 
            WHERE billing_id = NEW.billing_id AND status = 'Processed'
        ),
        deduction_status = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM billing_deductions 
                WHERE billing_id = NEW.billing_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM billing 
                WHERE id = NEW.billing_id
            ) THEN 'Completed'
            ELSE 'Active'
        END,
        completion_date = CASE 
            WHEN (
                SELECT COUNT(*) 
                FROM billing_deductions 
                WHERE billing_id = NEW.billing_id AND status = 'Processed'
            ) >= (
                SELECT total_deductions 
                FROM billing 
                WHERE id = NEW.billing_id
            ) THEN now()
            ELSE completion_date
        END
    WHERE id = NEW.billing_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update billing status when deductions are processed
CREATE TRIGGER update_billing_status_on_deduction_change
    AFTER UPDATE OF status ON billing_deductions
    FOR EACH ROW 
    WHEN (NEW.status = 'Processed' AND OLD.status != 'Processed')
    EXECUTE FUNCTION update_billing_deduction_status();

-- Create view for billing with deduction summary
CREATE OR REPLACE VIEW billing_with_deductions AS
SELECT 
    b.*,
    es."PAYROLL FIRST NAME" || ' ' || es."PAYROLL LAST NAME" AS tenant_name,
    p.title AS property_name,
    r.name AS room_name,
    COALESCE(SUM(bd.actual_amount), 0) as total_deducted,
    b.rent_amount - COALESCE(SUM(bd.actual_amount), 0) as remaining_balance,
    COUNT(bd.id) FILTER (WHERE bd.status = 'Pending') as pending_deductions,
    COUNT(bd.id) FILTER (WHERE bd.status = 'Failed') as failed_deductions,
    MIN(bd.deduction_date) FILTER (WHERE bd.status = 'Pending') as next_deduction_date
FROM billing b
LEFT JOIN external_staff es ON b.tenant_id = es.id
LEFT JOIN properties p ON b.property_id::text = p.id::text
LEFT JOIN rooms r ON b.room_id::text = r.id::text
LEFT JOIN billing_deductions bd ON b.id = bd.billing_id
GROUP BY b.id, b.tenant_id, b.property_id, b.room_id, b.rent_amount, 
         b.payment_status, b.billing_type, b.period_start, b.period_end,
         b.start_date, b.end_date, b.total_deductions, b.processed_deductions,
         b.deduction_status, b.completion_date, b.created_at, b.updated_at,
         es."PAYROLL FIRST NAME", es."PAYROLL LAST NAME", p.title, r.name;

-- Grant permissions on the view
GRANT SELECT ON billing_with_deductions TO authenticated;

-- Update existing billing records to set appropriate defaults
UPDATE billing 
SET 
    total_deductions = CASE 
        WHEN billing_type IN ('security_deposit', 'bus_card') THEN 3
        ELSE 1
    END,
    deduction_status = CASE 
        WHEN billing_type IN ('security_deposit', 'bus_card') THEN 'N/A'
        ELSE 'N/A'
    END
WHERE total_deductions IS NULL OR deduction_status IS NULL;

-- Add comments for documentation
COMMENT ON TABLE billing_deductions IS 'Scheduled payroll deductions for billing records that require deduction-based payment';
COMMENT ON VIEW billing_with_deductions IS 'Billing records with deduction summary and staff/property details';

COMMENT ON COLUMN billing.total_deductions IS 'Total number of deductions planned (1 for regular billing, 3 for security deposits/bus cards)';
COMMENT ON COLUMN billing.processed_deductions IS 'Number of deductions successfully processed';
COMMENT ON COLUMN billing.deduction_status IS 'Status of deduction processing (N/A for regular billing, Active/Completed/Cancelled for deduction-based billing)';
COMMENT ON COLUMN billing_deductions.deduction_sequence IS 'Order of deduction (1, 2, 3, etc.)';
COMMENT ON COLUMN billing_deductions.payroll_period IS 'Payroll period in YYYY-MM format';
COMMENT ON COLUMN billing_deductions.scheduled_amount IS 'Originally scheduled deduction amount';
COMMENT ON COLUMN billing_deductions.actual_amount IS 'Actual amount deducted (may differ due to adjustments)';
