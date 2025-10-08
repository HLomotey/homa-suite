-- Create optimized views for Operations analytics queries
-- This replaces client-side aggregation with database views for better performance

-- Job Orders Analytics View
CREATE OR REPLACE VIEW operations_job_orders_analytics AS
SELECT 
    -- Overall metrics
    COUNT(*) as total_job_orders,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as filled_orders,
    COUNT(*) FILTER (WHERE status IN ('APPROVED', 'IN_PROGRESS')) as open_orders,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders,
    COUNT(*) FILTER (WHERE status = 'ON_HOLD') as on_hold_orders,
    
    -- Fill rate calculation
    CASE 
        WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as fill_rate,
    
    -- Placement rate (completed vs total excluding cancelled)
    CASE 
        WHEN COUNT(*) FILTER (WHERE status != 'CANCELLED') > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / 
             COUNT(*) FILTER (WHERE status != 'CANCELLED')) * 100
        ELSE 0
    END as placement_rate,
    
    -- Average time to fill (for completed orders)
    AVG(closed_at - created_at) FILTER (WHERE status = 'COMPLETED' AND closed_at IS NOT NULL) as avg_time_to_fill,
    
    -- Recent activity (last 30 days)
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_orders,
    COUNT(*) FILTER (WHERE closed_at >= CURRENT_DATE - INTERVAL '30 days') as recent_fills,
    
    -- Priority breakdown
    COUNT(*) FILTER (WHERE priority = 'URGENT') as urgent_orders,
    COUNT(*) FILTER (WHERE priority = 'HIGH') as high_priority_orders,
    COUNT(*) FILTER (WHERE priority = 'MEDIUM') as medium_priority_orders,
    COUNT(*) FILTER (WHERE priority = 'LOW') as low_priority_orders,
    
    -- Location metrics
    COUNT(DISTINCT organization_id) as locations_with_orders,
    
    -- Note: Department metrics not available in current job_orders schema
    0 as departments_with_orders

FROM job_orders;

-- Monthly Job Orders Trends View
CREATE OR REPLACE VIEW operations_monthly_trends AS
SELECT 
    EXTRACT(YEAR FROM created_at) as year,
    EXTRACT(MONTH FROM created_at) as month,
    DATE_TRUNC('month', created_at) as month_start,
    TO_CHAR(created_at, 'Mon YYYY') as month_name,
    
    -- Order counts
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as filled_orders,
    COUNT(*) FILTER (WHERE status IN ('APPROVED', 'IN_PROGRESS')) as open_orders,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders,
    
    -- Performance metrics
    CASE 
        WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as monthly_fill_rate,
    
    -- Average time to fill for that month
    AVG(closed_at - created_at) FILTER (WHERE status = 'COMPLETED' AND closed_at IS NOT NULL) as avg_monthly_time_to_fill,
    
    -- Priority distribution
    COUNT(*) FILTER (WHERE priority = 'URGENT') as urgent_count,
    COUNT(*) FILTER (WHERE priority = 'HIGH') as high_count,
    COUNT(*) FILTER (WHERE priority = 'MEDIUM') as medium_count,
    COUNT(*) FILTER (WHERE priority = 'LOW') as low_count

FROM job_orders
GROUP BY 
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at),
    DATE_TRUNC('month', created_at),
    TO_CHAR(created_at, 'Mon YYYY')
ORDER BY year DESC, month DESC
LIMIT 12; -- Last 12 months

-- Department Performance View (placeholder - department data not available in current schema)
CREATE OR REPLACE VIEW operations_department_performance AS
SELECT 
    'N/A' as department,
    
    -- Order metrics
    0 as total_orders,
    0 as filled_orders,
    0 as open_orders,
    
    -- Performance metrics
    0.0 as department_fill_rate,
    
    -- Time metrics
    NULL::INTERVAL as avg_time_to_fill,
    
    -- Priority breakdown
    0 as urgent_orders,
    0 as high_priority_orders,
    
    -- Recent activity
    0 as recent_orders,
    
    -- Location diversity
    0 as locations_served

WHERE FALSE; -- Empty view since department data is not available

-- Location Performance View
CREATE OR REPLACE VIEW operations_location_performance AS
SELECT 
    l.name as location_name,
    l.id as location_id,
    
    -- Order metrics
    COUNT(jo.*) as total_orders,
    COUNT(jo.*) FILTER (WHERE jo.status = 'COMPLETED') as filled_orders,
    COUNT(jo.*) FILTER (WHERE jo.status IN ('APPROVED', 'IN_PROGRESS')) as open_orders,
    
    -- Performance metrics
    CASE 
        WHEN COUNT(jo.*) > 0 THEN 
            (COUNT(jo.*) FILTER (WHERE jo.status = 'COMPLETED')::DECIMAL / COUNT(jo.*)) * 100
        ELSE 0
    END as location_fill_rate,
    
    -- Time metrics
    AVG(jo.closed_at - jo.created_at) FILTER (WHERE jo.status = 'COMPLETED' AND jo.closed_at IS NOT NULL) as avg_time_to_fill,
    
    -- Note: Department data not available in current schema
    0 as departments_served,
    
    -- Recent activity
    COUNT(jo.*) FILTER (WHERE jo.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_orders

FROM staff_locations l
LEFT JOIN job_orders jo ON l.id = jo.organization_id
GROUP BY l.id, l.name;

-- Priority Analysis View
CREATE OR REPLACE VIEW operations_priority_analysis AS
SELECT 
    priority,
    
    -- Counts
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as filled_orders,
    COUNT(*) FILTER (WHERE status IN ('APPROVED', 'IN_PROGRESS')) as open_orders,
    
    -- Performance by priority
    CASE 
        WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as priority_fill_rate,
    
    -- Time to fill by priority
    AVG(closed_at - created_at) FILTER (WHERE status = 'COMPLETED' AND closed_at IS NOT NULL) as avg_time_to_fill,
    
    -- Aging analysis for open orders
    AVG(CURRENT_DATE - created_at) FILTER (WHERE status IN ('APPROVED', 'IN_PROGRESS')) as avg_open_age_days,
    
    -- Recent trends
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_orders

FROM job_orders
GROUP BY priority;

-- Weekly Performance Trends (last 12 weeks)
CREATE OR REPLACE VIEW operations_weekly_trends AS
SELECT 
    DATE_TRUNC('week', created_at) as week_start,
    TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') as week_label,
    
    -- Order metrics
    COUNT(*) as orders_created,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as orders_filled,
    
    -- Performance
    CASE 
        WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)) * 100
        ELSE 0
    END as weekly_fill_rate,
    
    -- Average time to fill
    AVG(closed_at - created_at) FILTER (WHERE status = 'COMPLETED' AND closed_at IS NOT NULL) as avg_time_to_fill

FROM job_orders
WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_orders_status_created 
ON job_orders(status, created_at);

CREATE INDEX IF NOT EXISTS idx_job_orders_department_status 
ON job_orders(department, status);

CREATE INDEX IF NOT EXISTS idx_job_orders_location_status 
ON job_orders(location_id, status);

CREATE INDEX IF NOT EXISTS idx_job_orders_priority_status 
ON job_orders(priority, status);

CREATE INDEX IF NOT EXISTS idx_job_orders_created_year_month 
ON job_orders((EXTRACT(YEAR FROM created_at)), (EXTRACT(MONTH FROM created_at)));

-- Grant permissions
GRANT SELECT ON operations_job_orders_analytics TO authenticated;
GRANT SELECT ON operations_monthly_trends TO authenticated;
GRANT SELECT ON operations_department_performance TO authenticated;
GRANT SELECT ON operations_location_performance TO authenticated;
GRANT SELECT ON operations_priority_analysis TO authenticated;
GRANT SELECT ON operations_weekly_trends TO authenticated;

-- Add comments
COMMENT ON VIEW operations_job_orders_analytics IS 'Overall job orders analytics including fill rates and performance metrics';
COMMENT ON VIEW operations_monthly_trends IS 'Monthly trends for job orders creation and completion';
COMMENT ON VIEW operations_department_performance IS 'Department-level job order performance metrics';
COMMENT ON VIEW operations_location_performance IS 'Location-level job order performance metrics';
COMMENT ON VIEW operations_priority_analysis IS 'Analysis of job order performance by priority level';
COMMENT ON VIEW operations_weekly_trends IS 'Weekly performance trends for the last 12 weeks';
