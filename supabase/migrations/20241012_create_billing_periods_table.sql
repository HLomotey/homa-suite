-- Create billing periods table for standardized billing cycles
-- This table defines the two billing periods per month: 1st-15th and 16th-end of month

-- Create billing periods table
CREATE TABLE IF NOT EXISTS billing_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('first_half', 'second_half')),
    start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 31),
    end_day INTEGER CHECK (end_day >= 1 AND end_day <= 31),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_billing_periods_period_type ON billing_periods(period_type);
CREATE INDEX IF NOT EXISTS idx_billing_periods_is_active ON billing_periods(is_active);

-- Insert the standard billing periods
INSERT INTO billing_periods (name, description, period_type, start_day, end_day, is_active) VALUES
('First Half Month', 'Billing period from 1st to 15th of each month', 'first_half', 1, 15, true),
('Second Half Month', 'Billing period from 16th to end of each month', 'second_half', 16, NULL, true)
ON CONFLICT DO NOTHING;

-- Create a function to get the current billing period
CREATE OR REPLACE FUNCTION get_current_billing_period()
RETURNS TABLE (
    period_id UUID,
    period_name VARCHAR(100),
    period_type VARCHAR(20),
    period_start_date DATE,
    period_end_date DATE
) AS $$
DECLARE
    current_day INTEGER;
    current_month_start DATE;
    current_month_end DATE;
BEGIN
    current_day := EXTRACT(DAY FROM CURRENT_DATE);
    current_month_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    current_month_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    
    IF current_day <= 15 THEN
        -- First half of month
        RETURN QUERY
        SELECT 
            bp.id,
            bp.name,
            bp.period_type,
            current_month_start,
            current_month_start + INTERVAL '14 days'
        FROM billing_periods bp
        WHERE bp.period_type = 'first_half' AND bp.is_active = true
        LIMIT 1;
    ELSE
        -- Second half of month
        RETURN QUERY
        SELECT 
            bp.id,
            bp.name,
            bp.period_type,
            current_month_start + INTERVAL '15 days',
            current_month_end
        FROM billing_periods bp
        WHERE bp.period_type = 'second_half' AND bp.is_active = true
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get billing period for a specific date
CREATE OR REPLACE FUNCTION get_billing_period_for_date(target_date DATE)
RETURNS TABLE (
    period_id UUID,
    period_name VARCHAR(100),
    period_type VARCHAR(20),
    period_start_date DATE,
    period_end_date DATE
) AS $$
DECLARE
    target_day INTEGER;
    target_month_start DATE;
    target_month_end DATE;
BEGIN
    target_day := EXTRACT(DAY FROM target_date);
    target_month_start := DATE_TRUNC('month', target_date)::DATE;
    target_month_end := (DATE_TRUNC('month', target_date) + INTERVAL '1 month - 1 day')::DATE;
    
    IF target_day <= 15 THEN
        -- First half of month
        RETURN QUERY
        SELECT 
            bp.id,
            bp.name,
            bp.period_type,
            target_month_start,
            target_month_start + INTERVAL '14 days'
        FROM billing_periods bp
        WHERE bp.period_type = 'first_half' AND bp.is_active = true
        LIMIT 1;
    ELSE
        -- Second half of month
        RETURN QUERY
        SELECT 
            bp.id,
            bp.name,
            bp.period_type,
            target_month_start + INTERVAL '15 days',
            target_month_end
        FROM billing_periods bp
        WHERE bp.period_type = 'second_half' AND bp.is_active = true
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy access to billing periods with calculated dates
CREATE OR REPLACE VIEW billing_periods_with_dates AS
SELECT 
    bp.id,
    bp.name,
    bp.description,
    bp.period_type,
    bp.start_day,
    bp.end_day,
    bp.is_active,
    -- Calculate current period dates
    CASE 
        WHEN bp.period_type = 'first_half' THEN DATE_TRUNC('month', CURRENT_DATE)::DATE
        ELSE (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '15 days')::DATE
    END as current_period_start,
    CASE 
        WHEN bp.period_type = 'first_half' THEN (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days')::DATE
        ELSE (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
    END as current_period_end,
    bp.created_at,
    bp.updated_at
FROM billing_periods bp
WHERE bp.is_active = true;

-- Grant permissions
GRANT SELECT ON billing_periods TO authenticated;
GRANT SELECT ON billing_periods TO service_role;
GRANT SELECT ON billing_periods_with_dates TO authenticated;
GRANT SELECT ON billing_periods_with_dates TO service_role;

-- Add comments for documentation
COMMENT ON TABLE billing_periods IS 'Standardized billing periods for utility and rent billing cycles';
COMMENT ON COLUMN billing_periods.period_type IS 'Type of billing period: first_half (1-15) or second_half (16-end)';
COMMENT ON COLUMN billing_periods.start_day IS 'Starting day of the billing period within a month';
COMMENT ON COLUMN billing_periods.end_day IS 'Ending day of the billing period (NULL means end of month)';
COMMENT ON FUNCTION get_current_billing_period() IS 'Returns the current billing period based on today''s date';
COMMENT ON FUNCTION get_billing_period_for_date(DATE) IS 'Returns the billing period for a specific date';
COMMENT ON VIEW billing_periods_with_dates IS 'Billing periods with calculated start and end dates for the current month';
