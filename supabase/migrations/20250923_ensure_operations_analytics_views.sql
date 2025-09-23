-- 2025-09-23 Ensure Operations analytics views exist and are queryable by frontend
-- This migration (re)creates the operations_* views used by useOperationsAnalytics

-- Monthly Job Orders Trends View
CREATE OR REPLACE VIEW public.operations_monthly_trends AS
SELECT 
    EXTRACT(YEAR FROM created_at)::int as year,
    EXTRACT(MONTH FROM created_at)::int as month,
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
FROM public.job_orders
GROUP BY 
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at),
    DATE_TRUNC('month', created_at),
    TO_CHAR(created_at, 'Mon YYYY')
ORDER BY year DESC, month DESC
LIMIT 12;

-- Overall Job Orders Analytics View
CREATE OR REPLACE VIEW public.operations_job_orders_analytics AS
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_orders,
  COUNT(*) FILTER (WHERE status IN ('APPROVED', 'IN_PROGRESS')) as open_orders,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders,
  CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)) * 100 ELSE 0 END as overall_fill_rate,
  AVG(closed_at - created_at) FILTER (WHERE status = 'COMPLETED' AND closed_at IS NOT NULL) as avg_time_to_fill,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_orders,
  COUNT(*) FILTER (WHERE closed_at >= CURRENT_DATE - INTERVAL '30 days') as recent_fills,
  COUNT(*) FILTER (WHERE priority = 'URGENT') as urgent_orders,
  COUNT(*) FILTER (WHERE priority = 'HIGH') as high_priority_orders,
  COUNT(*) FILTER (WHERE priority = 'MEDIUM') as medium_priority_orders,
  COUNT(*) FILTER (WHERE priority = 'LOW') as low_priority_orders,
  COUNT(DISTINCT organization_id) as locations_with_orders,
  0 as departments_with_orders
FROM public.job_orders;

-- Department Performance View (placeholder)
CREATE OR REPLACE VIEW public.operations_department_performance AS
SELECT 
  'N/A'::text as department,
  0::int as total_orders,
  0::int as filled_orders,
  0::int as open_orders,
  0.0::decimal as department_fill_rate,
  NULL::interval as avg_time_to_fill,
  0::int as urgent_orders,
  0::int as high_priority_orders,
  0::int as recent_orders,
  0::int as locations_served
WHERE FALSE;

-- Location Performance View
CREATE OR REPLACE VIEW public.operations_location_performance AS
SELECT 
  l.name as location_name,
  l.id as location_id,
  COUNT(jo.*) as total_orders,
  COUNT(jo.*) FILTER (WHERE jo.status = 'COMPLETED') as filled_orders,
  COUNT(jo.*) FILTER (WHERE jo.status IN ('APPROVED', 'IN_PROGRESS')) as open_orders,
  CASE 
    WHEN COUNT(jo.*) > 0 THEN 
      (COUNT(jo.*) FILTER (WHERE jo.status = 'COMPLETED')::DECIMAL / COUNT(jo.*)) * 100
    ELSE 0
  END as location_fill_rate,
  AVG(jo.closed_at - jo.created_at) FILTER (WHERE jo.status = 'COMPLETED' AND jo.closed_at IS NOT NULL) as avg_time_to_fill,
  0 as departments_served,
  COUNT(jo.*) FILTER (WHERE jo.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_orders
FROM public.staff_locations l
LEFT JOIN public.job_orders jo ON l.id = jo.organization_id
GROUP BY l.id, l.name;

-- Weekly Trends (optional helper)
CREATE OR REPLACE VIEW public.operations_weekly_trends AS
SELECT 
  DATE_TRUNC('week', created_at) as week_start,
  TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') as week_label,
  COUNT(*) as orders_created,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as orders_filled,
  CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)) * 100 ELSE 0 END as weekly_fill_rate,
  AVG(closed_at - created_at) FILTER (WHERE status = 'COMPLETED' AND closed_at IS NOT NULL) as avg_time_to_fill
FROM public.job_orders
WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- Grants
GRANT SELECT ON public.operations_job_orders_analytics TO authenticated;
GRANT SELECT ON public.operations_monthly_trends TO authenticated;
GRANT SELECT ON public.operations_department_performance TO authenticated;
GRANT SELECT ON public.operations_location_performance TO authenticated;
GRANT SELECT ON public.operations_weekly_trends TO authenticated;

-- Comments
COMMENT ON VIEW public.operations_monthly_trends IS 'Monthly trends for job orders creation and completion';
COMMENT ON VIEW public.operations_job_orders_analytics IS 'Overall job orders analytics including fill rates and performance metrics';
COMMENT ON VIEW public.operations_department_performance IS 'Department-level job order performance metrics (placeholder)';
COMMENT ON VIEW public.operations_location_performance IS 'Location-level job order performance metrics';
COMMENT ON VIEW public.operations_weekly_trends IS 'Weekly performance trends for the last 12 weeks';
