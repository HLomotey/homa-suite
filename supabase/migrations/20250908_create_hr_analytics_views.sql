-- Create optimized views for HR analytics queries
-- This replaces client-side aggregation with database views for better performance

-- HR Monthly Summary View
CREATE OR REPLACE VIEW hr_monthly_summary AS
SELECT 
    EXTRACT(YEAR FROM hire_date_parsed) as year,
    EXTRACT(MONTH FROM hire_date_parsed) as month,
    DATE_TRUNC('month', hire_date_parsed) as month_start,
    
    -- Hiring metrics
    COUNT(*) FILTER (WHERE hire_date_parsed IS NOT NULL) as total_hires,
    COUNT(*) FILTER (WHERE termination_date_parsed IS NOT NULL 
                     AND EXTRACT(YEAR FROM termination_date_parsed) = EXTRACT(YEAR FROM hire_date_parsed)
                     AND EXTRACT(MONTH FROM termination_date_parsed) = EXTRACT(MONTH FROM hire_date_parsed)) as same_month_terminations,
    
    -- Department breakdown
    COUNT(DISTINCT "HOME DEPARTMENT") as departments_with_hires,
    
    -- Location breakdown  
    COUNT(DISTINCT "LOCATION") as locations_with_hires,
    
    -- Position types
    COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Active') as active_hires,
    COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Terminated') as terminated_hires

FROM (
    SELECT *,
           CASE 
               WHEN "HIRE DATE" IS NOT NULL AND "HIRE DATE" != '' 
               THEN "HIRE DATE"::DATE 
               ELSE NULL 
           END as hire_date_parsed,
           CASE 
               WHEN "TERMINATION DATE" IS NOT NULL AND "TERMINATION DATE" != '' 
               THEN "TERMINATION DATE"::DATE 
               ELSE NULL 
           END as termination_date_parsed
    FROM external_staff
) es
WHERE hire_date_parsed IS NOT NULL
GROUP BY 
    EXTRACT(YEAR FROM hire_date_parsed),
    EXTRACT(MONTH FROM hire_date_parsed),
    DATE_TRUNC('month', hire_date_parsed);

-- HR Termination Summary View
CREATE OR REPLACE VIEW hr_termination_summary AS
SELECT 
    EXTRACT(YEAR FROM termination_date_parsed) as year,
    EXTRACT(MONTH FROM termination_date_parsed) as month,
    DATE_TRUNC('month', termination_date_parsed) as month_start,
    
    -- Termination metrics
    COUNT(*) as total_terminations,
    COUNT(DISTINCT "HOME DEPARTMENT") as departments_with_terminations,
    COUNT(DISTINCT "LOCATION") as locations_with_terminations,
    
    -- Average tenure calculation
    AVG(termination_date_parsed - hire_date_parsed) as avg_tenure_days,
    
    -- Termination by department
    COUNT(*) FILTER (WHERE "HOME DEPARTMENT" IS NOT NULL) as terminations_with_department

FROM (
    SELECT *,
           CASE 
               WHEN "HIRE DATE" IS NOT NULL AND "HIRE DATE" != '' 
               THEN "HIRE DATE"::DATE 
               ELSE NULL 
           END as hire_date_parsed,
           CASE 
               WHEN "TERMINATION DATE" IS NOT NULL AND "TERMINATION DATE" != '' 
               THEN "TERMINATION DATE"::DATE 
               ELSE NULL 
           END as termination_date_parsed
    FROM external_staff
) es
WHERE termination_date_parsed IS NOT NULL
GROUP BY 
    EXTRACT(YEAR FROM termination_date_parsed),
    EXTRACT(MONTH FROM termination_date_parsed),
    DATE_TRUNC('month', termination_date_parsed);

-- HR Current Staff Analytics View
CREATE OR REPLACE VIEW hr_current_analytics AS
SELECT 
    -- Overall metrics
    COUNT(*) as total_staff,
    COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Active') as active_staff,
    COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Terminated') as terminated_staff,
    COUNT(*) FILTER (WHERE termination_date_parsed IS NULL) as current_active,
    
    -- Department metrics
    COUNT(DISTINCT "HOME DEPARTMENT") as total_departments,
    COUNT(DISTINCT "LOCATION") as total_locations,
    
    -- Retention calculation (active vs total ever hired)
    CASE 
        WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Active')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as retention_rate,
    
    -- Recent hires (last 30 days)
    COUNT(*) FILTER (WHERE hire_date_parsed >= CURRENT_DATE - INTERVAL '30 days') as recent_hires,
    
    -- Recent terminations (last 30 days)
    COUNT(*) FILTER (WHERE termination_date_parsed >= CURRENT_DATE - INTERVAL '30 days') as recent_terminations,
    
    -- Average tenure for current active staff
    AVG(CURRENT_DATE - hire_date_parsed) FILTER (WHERE "POSITION STATUS" = 'Active') as avg_current_tenure_days

FROM (
    SELECT *,
           CASE 
               WHEN "HIRE DATE" IS NOT NULL AND "HIRE DATE" != '' 
               THEN "HIRE DATE"::DATE 
               ELSE NULL 
           END as hire_date_parsed,
           CASE 
               WHEN "TERMINATION DATE" IS NOT NULL AND "TERMINATION DATE" != '' 
               THEN "TERMINATION DATE"::DATE 
               ELSE NULL 
           END as termination_date_parsed
    FROM external_staff
) es;

-- HR Department Analytics View
CREATE OR REPLACE VIEW hr_department_analytics AS
SELECT 
    "HOME DEPARTMENT" as department,
    
    -- Staff counts
    COUNT(*) as total_staff,
    COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Active') as active_staff,
    COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Terminated') as terminated_staff,
    
    -- Hiring metrics
    COUNT(*) FILTER (WHERE hire_date_parsed >= CURRENT_DATE - INTERVAL '30 days') as recent_hires,
    COUNT(*) FILTER (WHERE termination_date_parsed >= CURRENT_DATE - INTERVAL '30 days') as recent_terminations,
    
    -- Retention rate by department
    CASE 
        WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE "POSITION STATUS" = 'Active')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as department_retention_rate,
    
    -- Average tenure by department
    AVG(CURRENT_DATE - hire_date_parsed) FILTER (WHERE "POSITION STATUS" = 'Active') as avg_tenure_days,
    
    -- Locations within department
    COUNT(DISTINCT "LOCATION") as locations_count

FROM (
    SELECT *,
           CASE 
               WHEN "HIRE DATE" IS NOT NULL AND "HIRE DATE" != '' 
               THEN "HIRE DATE"::DATE 
               ELSE NULL 
           END as hire_date_parsed,
           CASE 
               WHEN "TERMINATION DATE" IS NOT NULL AND "TERMINATION DATE" != '' 
               THEN "TERMINATION DATE"::DATE 
               ELSE NULL 
           END as termination_date_parsed
    FROM external_staff
) es
WHERE "HOME DEPARTMENT" IS NOT NULL
GROUP BY "HOME DEPARTMENT";

-- HR Monthly Trend View (combines hires and terminations)
CREATE OR REPLACE VIEW hr_monthly_trends AS
WITH parsed_staff AS (
    SELECT *,
           CASE 
               WHEN "HIRE DATE" IS NOT NULL AND "HIRE DATE" != '' 
               THEN "HIRE DATE"::DATE 
               ELSE NULL 
           END as hire_date_parsed,
           CASE 
               WHEN "TERMINATION DATE" IS NOT NULL AND "TERMINATION DATE" != '' 
               THEN "TERMINATION DATE"::DATE 
               ELSE NULL 
           END as termination_date_parsed
    FROM external_staff
),
monthly_data AS (
    -- Get all months from hire dates
    SELECT DISTINCT
        EXTRACT(YEAR FROM hire_date_parsed) as year,
        EXTRACT(MONTH FROM hire_date_parsed) as month,
        DATE_TRUNC('month', hire_date_parsed) as month_start
    FROM parsed_staff 
    WHERE hire_date_parsed IS NOT NULL
    
    UNION
    
    -- Get all months from termination dates
    SELECT DISTINCT
        EXTRACT(YEAR FROM termination_date_parsed) as year,
        EXTRACT(MONTH FROM termination_date_parsed) as month,
        DATE_TRUNC('month', termination_date_parsed) as month_start
    FROM parsed_staff 
    WHERE termination_date_parsed IS NOT NULL
),
hire_data AS (
    SELECT 
        EXTRACT(YEAR FROM hire_date_parsed) as year,
        EXTRACT(MONTH FROM hire_date_parsed) as month,
        COUNT(*) as hires
    FROM parsed_staff
    WHERE hire_date_parsed IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM hire_date_parsed), EXTRACT(MONTH FROM hire_date_parsed)
),
term_data AS (
    SELECT 
        EXTRACT(YEAR FROM termination_date_parsed) as year,
        EXTRACT(MONTH FROM termination_date_parsed) as month,
        COUNT(*) as terminations
    FROM parsed_staff
    WHERE termination_date_parsed IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM termination_date_parsed), EXTRACT(MONTH FROM termination_date_parsed)
),
active_data AS (
    SELECT 
        md.year,
        md.month,
        md.month_start,
        COUNT(*) as active_at_month_end
    FROM monthly_data md
    CROSS JOIN parsed_staff es
    WHERE es.hire_date_parsed <= (md.month_start + INTERVAL '1 month' - INTERVAL '1 day')
      AND (es.termination_date_parsed IS NULL OR es.termination_date_parsed > (md.month_start + INTERVAL '1 month' - INTERVAL '1 day'))
    GROUP BY md.year, md.month, md.month_start
)
SELECT 
    md.year,
    md.month,
    md.month_start,
    TO_CHAR(md.month_start, 'Mon') as month_name,
    COALESCE(hd.hires, 0) as hires,
    COALESCE(td.terminations, 0) as terminations,
    COALESCE(ad.active_at_month_end, 0) as active,
    COALESCE(hd.hires, 0) - COALESCE(td.terminations, 0) as net_change
FROM monthly_data md
LEFT JOIN hire_data hd ON md.year = hd.year AND md.month = hd.month
LEFT JOIN term_data td ON md.year = td.year AND md.month = td.month
LEFT JOIN active_data ad ON md.year = ad.year AND md.month = ad.month
ORDER BY md.year DESC, md.month DESC
LIMIT 12; -- Last 12 months

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_staff_hire_date_text 
ON external_staff("HIRE DATE");

CREATE INDEX IF NOT EXISTS idx_external_staff_term_date_text 
ON external_staff("TERMINATION DATE");

CREATE INDEX IF NOT EXISTS idx_external_staff_department_status 
ON external_staff("HOME DEPARTMENT", "POSITION STATUS");

CREATE INDEX IF NOT EXISTS idx_external_staff_location_status 
ON external_staff("LOCATION", "POSITION STATUS");

-- Grant permissions
GRANT SELECT ON hr_monthly_summary TO authenticated;
GRANT SELECT ON hr_termination_summary TO authenticated;
GRANT SELECT ON hr_current_analytics TO authenticated;
GRANT SELECT ON hr_department_analytics TO authenticated;
GRANT SELECT ON hr_monthly_trends TO authenticated;

-- Add comments
COMMENT ON VIEW hr_monthly_summary IS 'Monthly hiring metrics aggregated from external_staff table';
COMMENT ON VIEW hr_termination_summary IS 'Monthly termination metrics aggregated from external_staff table';
COMMENT ON VIEW hr_current_analytics IS 'Current HR analytics including retention rates and staff counts';
COMMENT ON VIEW hr_department_analytics IS 'Department-level HR metrics and analytics';
COMMENT ON VIEW hr_monthly_trends IS 'Combined monthly trends showing hires, terminations, and active staff counts';
