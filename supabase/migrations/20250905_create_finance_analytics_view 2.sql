-- Create optimized view for finance analytics queries
-- This view pre-calculates common metrics and aggregations to improve dashboard performance

-- First, let's add some additional status values that might be missing
DO $$ 
BEGIN
    -- Check if 'sent' status exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'sent' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'invoice_status')
    ) THEN
        ALTER TYPE invoice_status ADD VALUE 'sent';
    END IF;
END $$;

-- Create the finance analytics view
CREATE OR REPLACE VIEW finance_analytics_view AS
SELECT 
    -- Basic invoice information
    id,
    client_name,
    invoice_number,
    date_issued,
    invoice_status,
    date_paid,
    line_total,
    currency,
    
    -- Date components for easier filtering
    EXTRACT(YEAR FROM date_issued) as issue_year,
    EXTRACT(MONTH FROM date_issued) as issue_month,
    EXTRACT(QUARTER FROM date_issued) as issue_quarter,
    DATE_TRUNC('month', date_issued) as issue_month_start,
    
    -- Payment timing calculations
    CASE 
        WHEN date_paid IS NOT NULL THEN date_paid - date_issued
        ELSE NULL
    END as days_to_payment,
    
    -- Overdue calculations (assuming 30 days payment terms)
    CASE 
        WHEN invoice_status = 'overdue' THEN CURRENT_DATE - date_issued - 30
        ELSE NULL
    END as days_overdue,
    
    -- Status categorization for analytics
    CASE 
        WHEN invoice_status = 'paid' THEN 'paid'
        WHEN invoice_status = 'pending' OR invoice_status = 'sent' THEN 'outstanding'
        WHEN invoice_status = 'overdue' THEN 'overdue'
        WHEN invoice_status = 'cancelled' THEN 'cancelled'
        ELSE 'other'
    END as status_category,
    
    -- Revenue recognition
    CASE 
        WHEN invoice_status = 'paid' THEN line_total
        ELSE 0
    END as recognized_revenue,
    
    CASE 
        WHEN invoice_status IN ('pending', 'sent', 'overdue') THEN line_total
        ELSE 0
    END as outstanding_amount,
    
    -- Age buckets for aging analysis
    CASE 
        WHEN invoice_status = 'paid' THEN 'paid'
        WHEN CURRENT_DATE - date_issued <= 30 THEN '0-30 days'
        WHEN CURRENT_DATE - date_issued <= 60 THEN '31-60 days'
        WHEN CURRENT_DATE - date_issued <= 90 THEN '61-90 days'
        ELSE '90+ days'
    END as age_bucket,
    
    created_at,
    updated_at

FROM finance_invoices;

-- Create indexes on the base table for common query patterns
-- Note: Using functional indexes with IMMUTABLE functions only
CREATE INDEX IF NOT EXISTS idx_finance_invoices_year_month 
ON finance_invoices((EXTRACT(YEAR FROM date_issued)), (EXTRACT(MONTH FROM date_issued)));

CREATE INDEX IF NOT EXISTS idx_finance_invoices_status_date 
ON finance_invoices(invoice_status, date_issued);

CREATE INDEX IF NOT EXISTS idx_finance_invoices_client_status 
ON finance_invoices(client_name, invoice_status);

-- Additional index for date range queries
CREATE INDEX IF NOT EXISTS idx_finance_invoices_date_status 
ON finance_invoices(date_issued, invoice_status);

-- Create a materialized view for heavy analytics (optional - can be refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS finance_monthly_summary AS
SELECT 
    EXTRACT(YEAR FROM date_issued) as year,
    EXTRACT(MONTH FROM date_issued) as month,
    DATE_TRUNC('month', date_issued) as month_start,
    
    -- Count metrics
    COUNT(*) as total_invoices,
    COUNT(*) FILTER (WHERE invoice_status = 'paid') as paid_invoices,
    COUNT(*) FILTER (WHERE invoice_status IN ('pending', 'sent')) as sent_invoices,
    COUNT(*) FILTER (WHERE invoice_status = 'overdue') as overdue_invoices,
    COUNT(*) FILTER (WHERE invoice_status = 'cancelled') as cancelled_invoices,
    
    -- Revenue metrics
    SUM(line_total) as total_invoiced,
    SUM(line_total) FILTER (WHERE invoice_status = 'paid') as total_revenue,
    SUM(line_total) FILTER (WHERE invoice_status IN ('pending', 'sent', 'overdue')) as outstanding_revenue,
    
    -- Average metrics
    AVG(line_total) as average_invoice_value,
    AVG(line_total) FILTER (WHERE invoice_status = 'paid') as average_paid_invoice,
    
    -- Collection metrics
    CASE 
        WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE invoice_status = 'paid')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as collection_rate,
    
    -- Client metrics
    COUNT(DISTINCT client_name) as unique_clients
    
FROM finance_invoices
GROUP BY 
    EXTRACT(YEAR FROM date_issued),
    EXTRACT(MONTH FROM date_issued),
    DATE_TRUNC('month', date_issued);

-- Create index on materialized view (non-unique since we might have multiple records per month)
CREATE INDEX IF NOT EXISTS idx_finance_monthly_summary_year_month 
ON finance_monthly_summary(year, month);

-- Grant permissions
GRANT SELECT ON finance_analytics_view TO authenticated;
GRANT SELECT ON finance_monthly_summary TO authenticated;

-- Add comments
COMMENT ON VIEW finance_analytics_view IS 'Optimized view for finance dashboard analytics with pre-calculated metrics';
COMMENT ON MATERIALIZED VIEW finance_monthly_summary IS 'Monthly aggregated finance metrics for fast dashboard loading';

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_finance_monthly_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW finance_monthly_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on refresh function
GRANT EXECUTE ON FUNCTION refresh_finance_monthly_summary() TO authenticated;

COMMENT ON FUNCTION refresh_finance_monthly_summary() IS 'Refreshes the finance monthly summary materialized view';
