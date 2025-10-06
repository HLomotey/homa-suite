-- Create comprehensive housing report view
-- This view combines billing, utilities, assignments, and property data for detailed housing reports
CREATE OR REPLACE VIEW housing_report_view AS
SELECT -- Location and Property Info
    COALESCE(es."LOCATION", 'Unknown') as state,
    p.title as property,
    p.address as property_address,
    -- Housing Capacity and Occupancy
    COUNT(r.id) as housing_capacity,
    COUNT(
        CASE
            WHEN a.status = 'Active' THEN 1
        END
    ) as housing_occupancy,
    -- Rent Information
    AVG(a.rent_amount) as rent_per_employee,
    SUM(a.rent_amount) as total_rent_amount,
    -- Billing Information (from billing table)
    COALESCE(SUM(b.rent_amount), 0) as monthly_rent_charges,
    -- Utilities (from utility_setups table)
    COALESCE(SUM(CASE WHEN ut.name IN ('Propane', 'Gas') THEN us.billing_amount ELSE 0 END), 0) as propane,
    COALESCE(SUM(CASE WHEN ut.name IN ('Water', 'Sewer', 'Water/Sewer') THEN us.billing_amount ELSE 0 END), 0) as water_sewer_disposal,
    COALESCE(SUM(CASE WHEN ut.name = 'Electricity' THEN us.billing_amount ELSE 0 END), 0) as electricity,
    COALESCE(SUM(CASE WHEN ut.name IN ('Propane', 'Gas', 'Water', 'Sewer', 'Water/Sewer', 'Electricity') THEN us.billing_amount ELSE 0 END), 0) as total_utilities,
    -- Maintenance Costs (you may need to adjust this based on where maintenance costs are stored)
    COALESCE(SUM(CASE WHEN ut.name = 'Maintenance' THEN us.billing_amount ELSE 0 END), 0) as housing_maintenance,
    -- Total Costs
    COALESCE(SUM(b.rent_amount), 0) + 
    COALESCE(SUM(CASE WHEN ut.name IN ('Propane', 'Gas', 'Water', 'Sewer', 'Water/Sewer', 'Electricity') THEN us.billing_amount ELSE 0 END), 0) + 
    COALESCE(SUM(CASE WHEN ut.name = 'Maintenance' THEN us.billing_amount ELSE 0 END), 0) as total_cost,
    -- Expected Rent Calculations
    COUNT(
        CASE
            WHEN a.status = 'Active' THEN 1
        END
    ) * AVG(a.rent_amount) as expected_rent_occupancy,
    COUNT(r.id) * AVG(a.rent_amount) as expected_rent_capacity,
    -- Payroll Deductions (from security deposits or deduction tables)
    COALESCE(SUM(sdd.amount), 0) as actual_payroll_deductions,
    -- Variance Calculations
    (
        COALESCE(SUM(sdd.amount), 0) - (
            COUNT(
                CASE
                    WHEN a.status = 'Active' THEN 1
                END
            ) * AVG(a.rent_amount)
        )
    ) as variance_apd_rtc,
    (
        COALESCE(SUM(sdd.amount), 0) - (COUNT(r.id) * AVG(a.rent_amount))
    ) as variance_apd_rro,
    -- Date filters
    DATE_TRUNC(
        'month',
        COALESCE(b.period_start, a.start_date, CURRENT_DATE)
    ) as report_month,
    EXTRACT(
        YEAR
        FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)
    ) as report_year,
    EXTRACT(
        MONTH
        FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)
    ) as report_month_num
FROM properties p
    LEFT JOIN rooms r ON r.property_id = p.id
    LEFT JOIN assignments a ON a.property_id = p.id
    LEFT JOIN external_staff es ON es.id = a.tenant_id
    LEFT JOIN billing b ON b.property_id = p.id
    LEFT JOIN security_deposits sd ON sd.assignment_id = a.id
    LEFT JOIN security_deposit_deductions sdd ON sdd.security_deposit_id = sd.id
    -- Left join for utilities from utility_setups table
    LEFT JOIN utility_setups us ON us.property_id = p.id
    LEFT JOIN utility_types ut ON ut.id = us.utility_type_id
WHERE (p.status = 'active' OR p.status IS NULL)
GROUP BY p.id,
    p.title,
    p.address,
    es."LOCATION",
    DATE_TRUNC(
        'month',
        COALESCE(b.period_start, a.start_date, CURRENT_DATE)
    ),
    EXTRACT(
        YEAR
        FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)
    ),
    EXTRACT(
        MONTH
        FROM COALESCE(b.period_start, a.start_date, CURRENT_DATE)
    )
ORDER BY state,
    property;