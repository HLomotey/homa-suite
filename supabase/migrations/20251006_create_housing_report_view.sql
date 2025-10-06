-- Create comprehensive housing report view
-- This view combines billing, utilities, assignments, and property data for detailed housing reports

-- First, create utility_bills table if it doesn't exist
CREATE TABLE IF NOT EXISTS utility_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    utility_type VARCHAR(50) NOT NULL,
    -- 'propane', 'water_sewer', 'electricity', etc.
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    maintenance_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    billing_date DATE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    vendor VARCHAR(255),
    account_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view utility bills" ON utility_bills FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage utility bills" ON utility_bills FOR ALL USING (auth.role() = 'authenticated');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_utility_bills_property_id ON utility_bills(property_id);
CREATE INDEX IF NOT EXISTS idx_utility_bills_billing_date ON utility_bills(billing_date);
CREATE INDEX IF NOT EXISTS idx_utility_bills_utility_type ON utility_bills(utility_type);

-- Grant permissions
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON utility_bills TO authenticated;

-- Add comments
COMMENT ON TABLE utility_bills IS 'Utility billing records for properties including propane, water/sewer, electricity, etc.';
COMMENT ON COLUMN utility_bills.utility_type IS 'Type of utility: propane, water_sewer, electricity, gas, internet, etc.';
COMMENT ON COLUMN utility_bills.amount IS 'Billing amount for the utility service';
COMMENT ON COLUMN utility_bills.maintenance_cost IS 'Maintenance cost associated with the utility/property';
COMMENT ON COLUMN utility_bills.billing_date IS 'Date of the utility bill';

-- Now create the housing report view
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
    -- Utilities (you may need to adjust these based on your actual utility tables)
    COALESCE(SUM(u.propane_cost), 0) as propane,
    COALESCE(SUM(u.water_sewer_cost), 0) as water_sewer_disposal,
    COALESCE(SUM(u.electricity_cost), 0) as electricity,
    COALESCE(
        SUM(
            u.propane_cost + u.water_sewer_cost + u.electricity_cost
        ),
        0
    ) as total_utilities,
    -- Maintenance Costs (from utilities table)
    COALESCE(SUM(u.maintenance_cost), 0) as housing_maintenance,
    -- Total Costs
    COALESCE(SUM(b.rent_amount), 0) + COALESCE(
        SUM(
            u.propane_cost + u.water_sewer_cost + u.electricity_cost
        ),
        0
    ) + COALESCE(SUM(u.maintenance_cost), 0) as total_cost,
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
    -- Left join for utilities (create this table if it doesn't exist)
    LEFT JOIN (
        SELECT property_id,
            SUM(
                CASE
                    WHEN utility_type = 'propane' THEN amount
                    ELSE 0
                END
            ) as propane_cost,
            SUM(
                CASE
                    WHEN utility_type = 'water_sewer' THEN amount
                    ELSE 0
                END
            ) as water_sewer_cost,
            SUM(
                CASE
                    WHEN utility_type = 'electricity' THEN amount
                    ELSE 0
                END
            ) as electricity_cost,
            SUM(maintenance_cost) as maintenance_cost,
            DATE_TRUNC('month', billing_date) as utility_month
        FROM utility_bills
        GROUP BY property_id,
            DATE_TRUNC('month', billing_date)
    ) u ON u.property_id = p.id
    AND u.utility_month = DATE_TRUNC(
        'month',
        COALESCE(b.period_start, a.start_date, CURRENT_DATE)
    )
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