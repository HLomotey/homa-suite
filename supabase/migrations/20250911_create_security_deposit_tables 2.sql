-- Create security deposits table
CREATE TABLE security_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    paid_date DATE,
    refund_date DATE,
    refund_amount DECIMAL(10,2) DEFAULT 0 CHECK (refund_amount >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create deduction schedule table
CREATE TABLE security_deposit_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_deposit_id UUID NOT NULL REFERENCES security_deposits(id) ON DELETE CASCADE,
    deduction_number INTEGER NOT NULL CHECK (deduction_number BETWEEN 1 AND 4),
    scheduled_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'deducted', 'waived', 'adjusted')),
    actual_deduction_date DATE,
    actual_amount DECIMAL(10,2),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique deduction numbers per security deposit
    UNIQUE(security_deposit_id, deduction_number)
);

-- Create indexes for better performance
CREATE INDEX idx_security_deposits_assignment_id ON security_deposits(assignment_id);
CREATE INDEX idx_security_deposits_payment_status ON security_deposits(payment_status);
CREATE INDEX idx_deductions_security_deposit_id ON security_deposit_deductions(security_deposit_id);
CREATE INDEX idx_deductions_scheduled_date ON security_deposit_deductions(scheduled_date);
CREATE INDEX idx_deductions_status ON security_deposit_deductions(status);

-- Add RLS policies
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Security deposits policies
CREATE POLICY "Users can view security deposits" ON security_deposits
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert security deposits" ON security_deposits
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update security deposits" ON security_deposits
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Deduction schedule policies
CREATE POLICY "Users can view deduction schedules" ON security_deposit_deductions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert deduction schedules" ON security_deposit_deductions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update deduction schedules" ON security_deposit_deductions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE security_deposits IS 'Security deposits for housing assignments with payment tracking';
COMMENT ON TABLE security_deposit_deductions IS 'Bi-weekly deduction schedule for security deposits (industry standard 4 deductions)';

COMMENT ON COLUMN security_deposits.total_amount IS 'Total security deposit amount';
COMMENT ON COLUMN security_deposits.payment_method IS 'Method of payment (cash, check, bank_transfer, etc.)';
COMMENT ON COLUMN security_deposits.payment_status IS 'Current payment status of the deposit';

COMMENT ON COLUMN security_deposit_deductions.deduction_number IS 'Deduction sequence number (1-4 for bi-weekly schedule)';
COMMENT ON COLUMN security_deposit_deductions.scheduled_date IS 'Scheduled date for this deduction';
COMMENT ON COLUMN security_deposit_deductions.amount IS 'Scheduled deduction amount';
COMMENT ON COLUMN security_deposit_deductions.status IS 'Status of this deduction';

-- Create function to automatically create deduction schedule
CREATE OR REPLACE FUNCTION create_deduction_schedule()
RETURNS TRIGGER AS $$
DECLARE
    deduction_amount DECIMAL(10,2);
    start_date DATE;
BEGIN
    -- Calculate bi-weekly deduction amount (total / 4)
    deduction_amount := NEW.total_amount / 4;
    
    -- Start deductions 2 weeks after assignment start date
    SELECT start_date INTO start_date 
    FROM assignments 
    WHERE id = NEW.assignment_id;
    
    -- Create 4 bi-weekly deductions
    FOR i IN 1..4 LOOP
        INSERT INTO security_deposit_deductions (
            security_deposit_id,
            deduction_number,
            scheduled_date,
            amount,
            status
        ) VALUES (
            NEW.id,
            i,
            start_date + INTERVAL '2 weeks' * i,
            deduction_amount,
            'scheduled'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate deduction schedule
CREATE TRIGGER trigger_create_deduction_schedule
    AFTER INSERT ON security_deposits
    FOR EACH ROW
    EXECUTE FUNCTION create_deduction_schedule();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_security_deposits_updated_at
    BEFORE UPDATE ON security_deposits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deductions_updated_at
    BEFORE UPDATE ON security_deposit_deductions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
