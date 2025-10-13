-- Create comprehensive housing billing view with improved structure and billing periods
-- This view integrates assignments, billing, utilities, and deductions data with proper time-based aggregation

-- Drop existing views first to avoid conflicts
DROP VIEW IF EXISTS comprehensive_housing_billing_view CASCADE;
DROP VIEW IF EXISTS comprehensive_housing_billing_test CASCADE;

-- Create the comprehensive housing billing view with improved structure
CREATE OR REPLACE VIEW comprehensive_housing_billing_view AS
WITH numberofrooms AS (
    SELECT
        r.property_id,
        COUNT(*) FILTER (WHERE r.status = 'Available')   AS available_rooms,
        COUNT(*) FILTER (WHERE r.status = 'Occupied')    AS occupied_rooms,
        COUNT(*) FILTER (WHERE r.status = 'Maintenance') AS maintenance_rooms,
        COUNT(*) FILTER (WHERE r.status = 'Reserved')    AS reserved_rooms,
        COUNT(*) AS total_rooms
    FROM rooms r
    GROUP BY r.property_id
),
billing_summary AS (
    SELECT
        b.property_id,
        MIN(b.period_start) AS period_start,
        MAX(b.period_end)   AS period_end,
        DATE_TRUNC('month', MIN(b.period_start))::date AS billing_month,
        DATE_TRUNC('year', MIN(b.period_start))::date  AS billing_year,
        SUM(b.rent_amount) AS total_rent,
        COUNT(DISTINCT b.tenant_id) AS billed_tenants,
        COUNT(DISTINCT b.room_id)   AS billed_rooms
    FROM billing b
    GROUP BY b.property_id, DATE_TRUNC('month', b.period_start), DATE_TRUNC('year', b.period_start)
),
pivoted_utilities AS (
    SELECT
        us.property_id,
        bp.start_date,
        bp.end_date,
        bp.name AS billing_period_name,
        SUM(CASE WHEN ut.name = 'Water' THEN us.billing_amount ELSE 0 END) AS water,
        SUM(CASE WHEN ut.name = 'Electricity' THEN us.billing_amount ELSE 0 END) AS electricity,
        SUM(CASE WHEN ut.name = 'Gas' THEN us.billing_amount ELSE 0 END) AS gas,
        SUM(CASE WHEN ut.name = 'Internet' THEN us.billing_amount ELSE 0 END) AS internet
    FROM utility_setups us
    JOIN utility_types ut ON ut.id = us.utility_type_id
    JOIN billing_periods bp ON bp.id = us.billing_period_id
    GROUP BY us.property_id, bp.start_date, bp.end_date, bp.name
),
property_with_accounts AS (
    SELECT
        a.property_id,
        sl.state,
        ca.name AS company_account_name
    FROM assignments a
    JOIN external_staff es ON es.id = a.tenant_id
    JOIN staff_locations sl ON sl.location_description = es."LOCATION"
    JOIN company_accounts ca ON ca.id = sl.company_account_id
    GROUP BY a.property_id, sl.state, ca.name
)
SELECT 
    bs.property_id,
    MAX(p.title)   AS property_name,
    MAX(p.address) AS property_address,
    MAX(pwa.state) AS state,
    MAX(pwa.company_account_name) AS company_account_name,
    bs.billing_month,
    bs.billing_year,
    bs.period_start,
    bs.period_end,
    COALESCE(MAX(nr.available_rooms),0)    AS available_rooms,
    COALESCE(MAX(nr.occupied_rooms),0)     AS occupied_rooms,
    COALESCE(MAX(nr.maintenance_rooms),0)  AS maintenance_rooms,
    COALESCE(MAX(nr.reserved_rooms),0)     AS reserved_rooms,
    COALESCE(MAX(nr.total_rooms),0)        AS total_rooms,
    SUM(bs.total_rent)       AS total_rent,
    SUM(bs.billed_tenants)   AS billed_tenants,
    SUM(bs.billed_rooms)     AS billed_rooms,
    COALESCE(SUM(pu.water),0)       AS water,
    COALESCE(SUM(pu.electricity),0) AS electricity,
    COALESCE(SUM(pu.gas),0)         AS gas,
    COALESCE(SUM(pu.internet),0)    AS internet,
    MAX(pu.billing_period_name)     AS utility_billing_period
FROM billing_summary bs
LEFT JOIN numberofrooms nr
    ON bs.property_id = nr.property_id
LEFT JOIN pivoted_utilities pu
    ON bs.property_id = pu.property_id
   AND pu.start_date <= bs.period_end   -- overlap condition
   AND pu.end_date   >= bs.period_start
LEFT JOIN properties p
    ON bs.property_id = p.id
LEFT JOIN property_with_accounts pwa
    ON pwa.property_id = bs.property_id
GROUP BY bs.property_id, bs.billing_month, bs.billing_year, bs.period_start, bs.period_end
ORDER BY bs.property_id, bs.billing_year, bs.billing_month;

-- Create a simple test view for debugging
CREATE OR REPLACE VIEW comprehensive_housing_billing_test AS
SELECT 
    p.id as property_id,
    p.title as property_name,
    p.address as property_address,
    p.status as property_status,
    COUNT(a.id) as assignment_count,
    COUNT(r.id) as room_count
FROM properties p
LEFT JOIN assignments a ON p.id = a.property_id
LEFT JOIN rooms r ON p.id = r.property_id
GROUP BY p.id, p.title, p.address, p.status
ORDER BY p.title;

-- Grant permissions on both views
GRANT SELECT ON comprehensive_housing_billing_view TO authenticated;
GRANT SELECT ON comprehensive_housing_billing_view TO service_role;
GRANT SELECT ON comprehensive_housing_billing_test TO authenticated;
GRANT SELECT ON comprehensive_housing_billing_test TO service_role;

-- Add comments for documentation
COMMENT ON VIEW comprehensive_housing_billing_view IS 
'Comprehensive housing view with billing periods, room status tracking, utility pivoting, and state/company account integration';
COMMENT ON VIEW comprehensive_housing_billing_test IS 
'Simple test view for debugging property, assignment, and room relationships';
