-- Create flexible billing periods table for user-defined billing cycles
-- This replaces the hardcoded first/second half approach with user-managed periods

-- Drop existing standardized billing periods table if it exists
DROP TABLE IF EXISTS billing_periods CASCADE;

-- Create flexible billing periods table
CREATE TABLE billing_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'ARCHIVED')),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure end_date is after start_date
    CONSTRAINT check_date_order CHECK (end_date >= start_date),
    -- Ensure name is unique for active periods
    CONSTRAINT unique_active_period_name UNIQUE (name) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better performance
CREATE INDEX idx_billing_periods_status ON billing_periods(status);
CREATE INDEX idx_billing_periods_date_range ON billing_periods(start_date, end_date);
CREATE INDEX idx_billing_periods_created_by ON billing_periods(created_by);
CREATE INDEX idx_billing_periods_is_recurring ON billing_periods(is_recurring);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_billing_periods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_billing_periods_updated_at
    BEFORE UPDATE ON billing_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_periods_updated_at();

-- Drop existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_current_billing_period();

-- Create function to get current active billing period
CREATE OR REPLACE FUNCTION get_current_billing_period()
RETURNS TABLE (
    period_id UUID,
    period_name VARCHAR(100),
    period_start_date DATE,
    period_end_date DATE,
    period_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.name,
        bp.start_date,
        bp.end_date,
        bp.status
    FROM billing_periods bp
    WHERE bp.status = 'ACTIVE'
    AND CURRENT_DATE BETWEEN bp.start_date AND bp.end_date
    ORDER BY bp.start_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Drop existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_billing_period_for_date(DATE);

-- Create function to get billing period for a specific date
CREATE OR REPLACE FUNCTION get_billing_period_for_date(target_date DATE)
RETURNS TABLE (
    period_id UUID,
    period_name VARCHAR(100),
    period_start_date DATE,
    period_end_date DATE,
    period_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.name,
        bp.start_date,
        bp.end_date,
        bp.status
    FROM billing_periods bp
    WHERE target_date BETWEEN bp.start_date AND bp.end_date
    AND bp.status IN ('ACTIVE', 'CLOSED')
    ORDER BY bp.start_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate recurring billing periods
CREATE OR REPLACE FUNCTION generate_recurring_periods(
    base_period_id UUID,
    periods_to_generate INTEGER DEFAULT 12
)
RETURNS INTEGER AS $$
DECLARE
    base_period RECORD;
    new_start_date DATE;
    new_end_date DATE;
    i INTEGER;
    generated_count INTEGER := 0;
BEGIN
    -- Get the base period
    SELECT * INTO base_period 
    FROM billing_periods 
    WHERE id = base_period_id AND is_recurring = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Base period not found or not set as recurring';
    END IF;
    
    -- Generate periods based on recurrence type
    FOR i IN 1..periods_to_generate LOOP
        CASE base_period.recurrence_type
            WHEN 'MONTHLY' THEN
                new_start_date := base_period.end_date + INTERVAL '1 day' + (i-1) * INTERVAL '1 month';
                new_end_date := new_start_date + (base_period.end_date - base_period.start_date);
            WHEN 'QUARTERLY' THEN
                new_start_date := base_period.end_date + INTERVAL '1 day' + (i-1) * INTERVAL '3 months';
                new_end_date := new_start_date + (base_period.end_date - base_period.start_date);
            WHEN 'YEARLY' THEN
                new_start_date := base_period.end_date + INTERVAL '1 day' + (i-1) * INTERVAL '1 year';
                new_end_date := new_start_date + (base_period.end_date - base_period.start_date);
        END CASE;
        
        -- Insert new period if it doesn't already exist
        INSERT INTO billing_periods (
            name, 
            description, 
            start_date, 
            end_date, 
            status, 
            is_recurring, 
            recurrence_type, 
            created_by
        )
        SELECT 
            base_period.name || ' - ' || TO_CHAR(new_start_date, 'Mon YYYY'),
            base_period.description,
            new_start_date,
            new_end_date,
            'ACTIVE',
            false, -- Generated periods are not recurring themselves
            NULL,
            base_period.created_by
        WHERE NOT EXISTS (
            SELECT 1 FROM billing_periods 
            WHERE start_date = new_start_date 
            AND end_date = new_end_date
        );
        
        IF FOUND THEN
            generated_count := generated_count + 1;
        END IF;
    END LOOP;
    
    RETURN generated_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for active billing periods with additional info
CREATE OR REPLACE VIEW active_billing_periods AS
SELECT 
    bp.*,
    CASE 
        WHEN CURRENT_DATE < bp.start_date THEN 'UPCOMING'
        WHEN CURRENT_DATE BETWEEN bp.start_date AND bp.end_date THEN 'CURRENT'
        WHEN CURRENT_DATE > bp.end_date THEN 'PAST'
    END as period_status_relative,
    (bp.end_date - bp.start_date + 1) as duration_days,
    CASE 
        WHEN CURRENT_DATE BETWEEN bp.start_date AND bp.end_date 
        THEN (CURRENT_DATE - bp.start_date + 1)
        ELSE 0
    END as days_elapsed,
    CASE 
        WHEN CURRENT_DATE BETWEEN bp.start_date AND bp.end_date 
        THEN (bp.end_date - CURRENT_DATE)
        ELSE 0
    END as days_remaining
FROM billing_periods bp
WHERE bp.status = 'ACTIVE'
ORDER BY bp.start_date;

-- Insert some default billing periods for demonstration
INSERT INTO billing_periods (name, description, start_date, end_date, status, is_recurring, recurrence_type) VALUES
('Q4 2024', 'Fourth Quarter 2024 Billing Period', '2024-10-01', '2024-12-31', 'ACTIVE', true, 'QUARTERLY'),
('January 2025', 'January 2025 Monthly Billing', '2025-01-01', '2025-01-31', 'ACTIVE', true, 'MONTHLY'),
('February 2025', 'February 2025 Monthly Billing', '2025-02-01', '2025-02-28', 'ACTIVE', true, 'MONTHLY');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON billing_periods TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON billing_periods TO service_role;
GRANT SELECT ON active_billing_periods TO authenticated;
GRANT SELECT ON active_billing_periods TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Add RLS policies
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all billing periods
CREATE POLICY "Users can view billing periods" ON billing_periods
    FOR SELECT USING (true);

-- Policy: Authenticated users can insert billing periods
CREATE POLICY "Authenticated users can create billing periods" ON billing_periods
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update billing periods they created (or allow all authenticated users for now)
CREATE POLICY "Users can update their billing periods" ON billing_periods
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR 
        auth.role() = 'authenticated'
    );

-- Policy: Users can delete billing periods they created (or allow all authenticated users for now)
CREATE POLICY "Users can delete their billing periods" ON billing_periods
    FOR DELETE USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR 
        auth.role() = 'authenticated'
    );

-- Add comments for documentation
COMMENT ON TABLE billing_periods IS 'Flexible billing periods that can be created and managed by users';
COMMENT ON COLUMN billing_periods.name IS 'Unique name for the billing period';
COMMENT ON COLUMN billing_periods.start_date IS 'Start date of the billing period';
COMMENT ON COLUMN billing_periods.end_date IS 'End date of the billing period';
COMMENT ON COLUMN billing_periods.status IS 'Status: ACTIVE, CLOSED, or ARCHIVED';
COMMENT ON COLUMN billing_periods.is_recurring IS 'Whether this period should generate future periods automatically';
COMMENT ON COLUMN billing_periods.recurrence_type IS 'How often to recur: MONTHLY, QUARTERLY, or YEARLY';
COMMENT ON FUNCTION get_current_billing_period() IS 'Returns the currently active billing period';
COMMENT ON FUNCTION get_billing_period_for_date(DATE) IS 'Returns the billing period that contains the specified date';
COMMENT ON FUNCTION generate_recurring_periods(UUID, INTEGER) IS 'Generates future billing periods based on a recurring period template';
COMMENT ON VIEW active_billing_periods IS 'Active billing periods with calculated status and duration information';
