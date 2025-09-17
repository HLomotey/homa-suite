-- Create finance_expense_analytics view for comprehensive expense reporting
CREATE OR REPLACE VIEW finance_expense_analytics AS
SELECT 
    fe.*,
    p.name as property_name,
    p.address as property_address,
    p.rent_amount as property_rent,
    au.email as created_by_email,
    approver.email as approved_by_email
FROM finance_expenses fe
LEFT JOIN properties p ON fe.property_id = p.id
LEFT JOIN auth.users au ON fe.created_by = au.id
LEFT JOIN auth.users approver ON fe.approved_by = approver.id;

-- Create profit & loss materialized view for performance
CREATE MATERIALIZED VIEW IF NOT EXISTS finance_profit_loss_summary AS
SELECT 
    DATE_TRUNC('month', period_date) as period,
    EXTRACT(YEAR FROM period_date) as year,
    EXTRACT(MONTH FROM period_date) as month,
    SUM(revenue) as total_revenue,
    SUM(expenses) as total_expenses,
    SUM(revenue) - SUM(expenses) as net_profit,
    CASE 
        WHEN SUM(revenue) > 0 THEN 
            ROUND(((SUM(revenue) - SUM(expenses)) / SUM(revenue) * 100)::numeric, 2)
        ELSE 0 
    END as profit_margin_percentage,
    COUNT(DISTINCT revenue_transactions) as revenue_transaction_count,
    COUNT(DISTINCT expense_transactions) as expense_transaction_count
FROM (
    -- Revenue data from paid invoices (cash basis accounting)
    SELECT 
        COALESCE(fi.date_paid, fi.date_issued) as period_date,
        CASE WHEN fi.invoice_status = 'paid' AND fi.date_paid IS NOT NULL 
             THEN fi.line_total ELSE 0 END as revenue,
        0 as expenses,
        fi.id as revenue_transactions,
        NULL as expense_transactions
    FROM finance_invoices fi
    
    UNION ALL
    
    -- Expense data from approved expenses
    SELECT 
        fe.date as period_date,
        0 as revenue,
        CASE WHEN fe.approval_status = 'approved' 
             THEN fe.amount ELSE 0 END as expenses,
        NULL as revenue_transactions,
        fe.id as expense_transactions
    FROM finance_expenses fe
) combined_data
GROUP BY DATE_TRUNC('month', period_date)
ORDER BY period DESC;

-- Create unique index on the materialized view for better performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_pl_summary_period 
ON finance_profit_loss_summary (period);

-- Create additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_finance_pl_summary_year_month 
ON finance_profit_loss_summary (year, month);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_finance_profit_loss_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY finance_profit_loss_summary;
END;
$$ LANGUAGE plpgsql;

-- Create monthly expense summary view for quick category analysis
CREATE OR REPLACE VIEW finance_monthly_expense_summary AS
SELECT 
    DATE_TRUNC('month', fe.date) as period,
    EXTRACT(YEAR FROM fe.date) as year,
    EXTRACT(MONTH FROM fe.date) as month,
    fe.category,
    fe.property_id,
    p.name as property_name,
    COUNT(*) as transaction_count,
    SUM(fe.amount) as total_amount,
    AVG(fe.amount) as average_amount,
    MIN(fe.amount) as min_amount,
    MAX(fe.amount) as max_amount,
    COUNT(CASE WHEN fe.approval_status = 'approved' THEN 1 END) as approved_count,
    SUM(CASE WHEN fe.approval_status = 'approved' THEN fe.amount ELSE 0 END) as approved_amount
FROM finance_expenses fe
LEFT JOIN properties p ON fe.property_id = p.id
GROUP BY 
    DATE_TRUNC('month', fe.date),
    EXTRACT(YEAR FROM fe.date),
    EXTRACT(MONTH FROM fe.date),
    fe.category,
    fe.property_id,
    p.name
ORDER BY period DESC, total_amount DESC;

-- Create revenue forecasting base view
CREATE OR REPLACE VIEW finance_revenue_trends AS
SELECT 
    DATE_TRUNC('month', COALESCE(fi.date_paid, fi.date_issued)) as period,
    EXTRACT(YEAR FROM COALESCE(fi.date_paid, fi.date_issued)) as year,
    EXTRACT(MONTH FROM COALESCE(fi.date_paid, fi.date_issued)) as month,
    fi.client_name,
    COUNT(*) as invoice_count,
    SUM(CASE WHEN fi.invoice_status = 'paid' AND fi.date_paid IS NOT NULL 
             THEN fi.line_total ELSE 0 END) as paid_revenue,
    SUM(fi.line_total) as total_invoiced,
    AVG(CASE WHEN fi.invoice_status = 'paid' AND fi.date_paid IS NOT NULL 
             THEN fi.line_total END) as avg_paid_invoice_value,
    COUNT(CASE WHEN fi.invoice_status = 'paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN fi.invoice_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN fi.invoice_status = 'overdue' THEN 1 END) as overdue_count
FROM finance_invoices fi
GROUP BY 
    DATE_TRUNC('month', COALESCE(fi.date_paid, fi.date_issued)),
    EXTRACT(YEAR FROM COALESCE(fi.date_paid, fi.date_issued)),
    EXTRACT(MONTH FROM COALESCE(fi.date_paid, fi.date_issued)),
    fi.client_name
ORDER BY period DESC, paid_revenue DESC;

-- Create comprehensive financial dashboard view
CREATE OR REPLACE VIEW finance_dashboard_summary AS
SELECT 
    pls.period,
    pls.year,
    pls.month,
    pls.total_revenue,
    pls.total_expenses,
    pls.net_profit,
    pls.profit_margin_percentage,
    pls.revenue_transaction_count,
    pls.expense_transaction_count,
    
    -- Revenue metrics
    rt.invoice_count,
    rt.paid_count,
    rt.pending_count,
    rt.overdue_count,
    rt.avg_paid_invoice_value,
    
    -- Expense breakdown (top 3 categories)
    (SELECT json_agg(
        json_build_object(
            'category', category,
            'amount', approved_amount,
            'percentage', ROUND((approved_amount / NULLIF(pls.total_expenses, 0) * 100)::numeric, 2)
        ) ORDER BY approved_amount DESC
    ) FROM (
        SELECT category, SUM(approved_amount) as approved_amount
        FROM finance_monthly_expense_summary mes
        WHERE mes.period = pls.period
        GROUP BY category
        ORDER BY approved_amount DESC
        LIMIT 3
    ) top_expenses) as top_expense_categories
    
FROM finance_profit_loss_summary pls
LEFT JOIN (
    SELECT 
        period,
        SUM(invoice_count) as invoice_count,
        SUM(paid_count) as paid_count,
        SUM(pending_count) as pending_count,
        SUM(overdue_count) as overdue_count,
        AVG(avg_paid_invoice_value) as avg_paid_invoice_value
    FROM finance_revenue_trends
    GROUP BY period
) rt ON pls.period = rt.period
ORDER BY pls.period DESC;

-- Grant permissions for the views
GRANT SELECT ON finance_expense_analytics TO authenticated;
GRANT SELECT ON finance_profit_loss_summary TO authenticated;
GRANT SELECT ON finance_monthly_expense_summary TO authenticated;
GRANT SELECT ON finance_revenue_trends TO authenticated;
GRANT SELECT ON finance_dashboard_summary TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW finance_expense_analytics IS 'Comprehensive expense view with property and user details for reporting';
COMMENT ON MATERIALIZED VIEW finance_profit_loss_summary IS 'Pre-computed P&L summary by month for dashboard performance';
COMMENT ON VIEW finance_monthly_expense_summary IS 'Monthly expense aggregations by category and property';
COMMENT ON VIEW finance_revenue_trends IS 'Revenue trend analysis with client and invoice status breakdowns';
COMMENT ON VIEW finance_dashboard_summary IS 'Complete financial dashboard data in a single view';