-- Create a view for projection summary data grouped by company and time periods
CREATE OR REPLACE VIEW projection_summary AS
SELECT 
    -- Company and location info
    COALESCE(cl.name, p.location_description, 'Unknown Company') as company_name,
    p.location_description,
    p.location_id,
    
    -- Time groupings
    EXTRACT(YEAR FROM p.projection_date) as year,
    EXTRACT(MONTH FROM p.projection_date) as month,
    TO_CHAR(p.projection_date, 'Month') as month_name,
    DATE_TRUNC('year', p.projection_date) as year_period,
    DATE_TRUNC('month', p.projection_date) as month_period,
    
    -- Aggregated metrics
    COUNT(*) as projection_count,
    
    -- Hours aggregations
    SUM(p.expected_hours) as total_expected_hours,
    SUM(p.actual_hours) as total_actual_hours,
    AVG(p.expected_hours) as avg_expected_hours,
    AVG(p.actual_hours) as avg_actual_hours,
    
    -- Revenue aggregations
    SUM(p.expected_revenue) as total_expected_revenue,
    SUM(p.actual_revenue) as total_actual_revenue,
    AVG(p.expected_revenue) as avg_expected_revenue,
    AVG(p.actual_revenue) as avg_actual_revenue,
    
    -- Expenditure aggregations
    SUM(p.monthly_gross_wages_salaries) as total_monthly_gross_wages_salaries,
    SUM(p.monthly_gross_income) as total_monthly_gross_income,
    SUM(p.payroll_taxes) as total_payroll_taxes,
    SUM(p.admin_cost) as total_admin_cost,
    SUM(p.management_payroll_expenses) as total_management_payroll_expenses,
    SUM(p.estimated_other) as total_estimated_other,
    SUM(p.employee_engagement) as total_employee_engagement,
    SUM(p.health_insurance_benefits) as total_health_insurance_benefits,
    SUM(p.travel) as total_travel,
    SUM(p.other_benefits) as total_other_benefits,
    
    -- Total expenditures calculation
    SUM(
        COALESCE(p.payroll_taxes, 0) + 
        COALESCE(p.admin_cost, 0) + 
        COALESCE(p.management_payroll_expenses, 0) + 
        COALESCE(p.estimated_other, 0) + 
        COALESCE(p.employee_engagement, 0) + 
        COALESCE(p.health_insurance_benefits, 0) + 
        COALESCE(p.travel, 0) + 
        COALESCE(p.other_benefits, 0)
    ) as total_expenditures,
    
    -- Variance calculations
    AVG(p.variance_percentage) as avg_variance_percentage,
    AVG(p.estimator_percentage) as avg_estimator_percentage,
    
    -- Status distribution
    COUNT(CASE WHEN p.status = 'DRAFT' THEN 1 END) as draft_count,
    COUNT(CASE WHEN p.status = 'ACTIVE' THEN 1 END) as active_count,
    COUNT(CASE WHEN p.status = 'UNDER_REVIEW' THEN 1 END) as under_review_count,
    COUNT(CASE WHEN p.status = 'APPROVED' THEN 1 END) as approved_count,
    COUNT(CASE WHEN p.status = 'ARCHIVED' THEN 1 END) as archived_count,
    
    -- Priority distribution
    COUNT(CASE WHEN p.priority = 'LOW' THEN 1 END) as low_priority_count,
    COUNT(CASE WHEN p.priority = 'MEDIUM' THEN 1 END) as medium_priority_count,
    COUNT(CASE WHEN p.priority = 'HIGH' THEN 1 END) as high_priority_count,
    COUNT(CASE WHEN p.priority = 'URGENT' THEN 1 END) as urgent_priority_count,
    
    -- Date ranges
    MIN(p.projection_date) as earliest_projection_date,
    MAX(p.projection_date) as latest_projection_date,
    MIN(p.created_at) as earliest_created_at,
    MAX(p.updated_at) as latest_updated_at

FROM projections p
LEFT JOIN company_locations cl ON p.location_id = cl.id
WHERE p.projection_date IS NOT NULL
GROUP BY 
    COALESCE(cl.name, p.location_description, 'Unknown Company'),
    p.location_description,
    p.location_id,
    EXTRACT(YEAR FROM p.projection_date),
    EXTRACT(MONTH FROM p.projection_date),
    TO_CHAR(p.projection_date, 'Month'),
    DATE_TRUNC('year', p.projection_date),
    DATE_TRUNC('month', p.projection_date)
ORDER BY 
    company_name,
    year DESC,
    month DESC;

-- Create indexes to improve view performance
CREATE INDEX IF NOT EXISTS idx_projections_summary_company_year 
ON projections (location_id, EXTRACT(YEAR FROM projection_date));

CREATE INDEX IF NOT EXISTS idx_projections_summary_company_month 
ON projections (location_id, EXTRACT(YEAR FROM projection_date), EXTRACT(MONTH FROM projection_date));

-- Add comments
COMMENT ON VIEW projection_summary IS 'Aggregated projection data grouped by company and time periods for summary reporting';
