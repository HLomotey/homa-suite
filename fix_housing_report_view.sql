-- Fix for housing_report_view - Create a simplified version that works with existing data

-- First, drop the existing view if it exists
DROP VIEW IF EXISTS housing_report_view;

-- Create a simplified housing report view that works with available data
CREATE OR REPLACE VIEW housing_report_view AS
SELECT 
    -- Location and Property Info
    COALESCE(es."LOCATION", 'Unknown') as state,
    COALESCE(p.title, 'Unknown Property') as property,
    COALESCE(p.address, '') as property_address,
    
    -- Housing Capacity and Occupancy
    COALESCE(COUNT(DISTINCT r.id), 0) as housing_capacity,
    COALESCE(COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.id END), 0) as housing_occupancy,
    
    -- Rent Information
    COALESCE(AVG(CASE WHEN a.rent_amount > 0 THEN a.rent_amount END), 0) as rent_per_employee,
    COALESCE(SUM(CASE WHEN a.status = 'Active' THEN a.rent_amount ELSE 0 END), 0) as total_rent_amount,
    
    -- Billing Information (from billing table if exists, otherwise from assignments)
    COALESCE(SUM(CASE WHEN b.rent_amount IS NOT NULL THEN b.rent_amount ELSE a.rent_amount END), 0) as monthly_rent_charges,
    
    -- Utilities (simplified - use 0 if utility_setups doesn't exist or has no data)
    COALESCE(SUM(CASE WHEN ut.name ILIKE '%propane%' OR ut.name ILIKE '%gas%' THEN us.billing_amount ELSE 0 END), 0) as propane,
    COALESCE(SUM(CASE WHEN ut.name ILIKE '%water%' OR ut.name ILIKE '%sewer%' THEN us.billing_amount ELSE 0 END), 0) as water_sewer_disposal,
    COALESCE(SUM(CASE WHEN ut.name ILIKE '%electric%' THEN us.billing_amount ELSE 0 END), 0) as electricity,
    COALESCE(SUM(CASE WHEN ut.name ILIKE '%propane%' OR ut.name ILIKE '%gas%' OR ut.name ILIKE '%water%' OR ut.name ILIKE '%sewer%' OR ut.name ILIKE '%electric%' THEN us.billing_amount ELSE 0 END), 0) as total_utilities,
    
    -- Maintenance Costs
    COALESCE(SUM(CASE WHEN ut.name ILIKE '%maintenance%' THEN us.billing_amount ELSE 0 END), 0) as housing_maintenance,
    
    -- Total Costs (rent + utilities + maintenance)
    COALESCE(SUM(CASE WHEN b.rent_amount IS NOT NULL THEN b.rent_amount ELSE a.rent_amount END), 0) + 
    COALESCE(SUM(CASE WHEN ut.name ILIKE '%propane%' OR ut.name ILIKE '%gas%' OR ut.name ILIKE '%water%' OR ut.name ILIKE '%sewer%' OR ut.name ILIKE '%electric%' OR ut.name ILIKE '%maintenance%' THEN us.billing_amount ELSE 0 END), 0) as total_cost,
    
    -- Expected Rent Calculations
    COALESCE(COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.id END), 0) * COALESCE(AVG(CASE WHEN a.rent_amount > 0 THEN a.rent_amount END), 0) as expected_rent_occupancy,
    COALESCE(COUNT(DISTINCT r.id), 0) * COALESCE(AVG(CASE WHEN a.rent_amount > 0 THEN a.rent_amount END), 0) as expected_rent_capacity,
    
    -- Payroll Deductions (from security deposits if available)
    COALESCE(SUM(sdd.amount), 0) as actual_payroll_deductions,
    
    -- Variance Calculations
    COALESCE(SUM(sdd.amount), 0) - (COALESCE(COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.id END), 0) * COALESCE(AVG(CASE WHEN a.rent_amount > 0 THEN a.rent_amount END), 0)) as variance_apd_rtc,
    COALESCE(SUM(sdd.amount), 0) - (COALESCE(COUNT(DISTINCT r.id), 0) * COALESCE(AVG(CASE WHEN a.rent_amount > 0 THEN a.rent_amount END), 0)) as variance_apd_rro,
    
    -- Date filters
    DATE_TRUNC('month', COALESCE(b.period_start, a.start_date, CURRENT_DATE)) as report_month,
    EXTRACT(YEAR FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)) as report_year,
    EXTRACT(MONTH FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)) as report_month_num
    
FROM properties p
    LEFT JOIN rooms r ON r.property_id = p.id
    LEFT JOIN assignments a ON a.property_id = p.id AND a.status IS NOT NULL
    LEFT JOIN external_staff es ON es.id = a.tenant_id
    LEFT JOIN billing b ON b.property_id = p.id
    LEFT JOIN security_deposits sd ON sd.assignment_id = a.id
    LEFT JOIN security_deposit_deductions sdd ON sdd.security_deposit_id = sd.id
    -- Left join for utilities (these tables might not exist or have data)
    LEFT JOIN utility_setups us ON us.property_id = p.id
    LEFT JOIN utility_types ut ON ut.id = us.utility_type_id
    
WHERE (p.status = 'active' OR p.status IS NULL OR p.status = 'Active')
    AND p.id IS NOT NULL
    
GROUP BY 
    p.id,
    p.title,
    p.address,
    es."LOCATION",
    DATE_TRUNC('month', COALESCE(b.period_start, a.start_date, CURRENT_DATE)),
    EXTRACT(YEAR FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)),
    EXTRACT(MONTH FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE))
    
HAVING COUNT(DISTINCT p.id) > 0  -- Ensure we have at least one property
    
ORDER BY state, property;

-- Add a comment to the view
COMMENT ON VIEW housing_report_view IS 'Comprehensive housing report view with billing, utilities, and financial analysis - simplified version';