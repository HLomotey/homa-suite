-- Function to refresh all finance materialized views
CREATE OR REPLACE FUNCTION refresh_all_finance_views()
RETURNS void AS $$
BEGIN
    -- Refresh the profit & loss summary
    PERFORM refresh_finance_profit_loss_summary();
    
    -- Log the refresh
    RAISE NOTICE 'Finance materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get expense analytics for a date range
CREATE OR REPLACE FUNCTION get_expense_analytics(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    property_filter UUID DEFAULT NULL,
    category_filter expense_category DEFAULT NULL
)
RETURNS TABLE (
    total_expenses DECIMAL(15,2),
    expense_count BIGINT,
    avg_expense DECIMAL(15,2),
    category_breakdown JSON,
    property_breakdown JSON,
    monthly_trend JSON
) AS $$
DECLARE
    date_filter_start DATE;
    date_filter_end DATE;
BEGIN
    -- Set default date range if not provided (last 12 months)
    date_filter_start := COALESCE(start_date, CURRENT_DATE - INTERVAL '12 months');
    date_filter_end := COALESCE(end_date, CURRENT_DATE);
    
    RETURN QUERY
    SELECT 
        SUM(fe.amount)::DECIMAL(15,2) as total_expenses,
        COUNT(*)::BIGINT as expense_count,
        AVG(fe.amount)::DECIMAL(15,2) as avg_expense,
        
        -- Category breakdown
        (SELECT json_agg(
            json_build_object(
                'category', category,
                'amount', total_amount,
                'count', expense_count,
                'percentage', ROUND((total_amount / SUM(fe.amount) * 100)::numeric, 2)
            ) ORDER BY total_amount DESC
        ) FROM (
            SELECT 
                fe2.category,
                SUM(fe2.amount) as total_amount,
                COUNT(*) as expense_count
            FROM finance_expenses fe2
            WHERE fe2.date BETWEEN date_filter_start AND date_filter_end
                AND fe2.approval_status = 'approved'
                AND (property_filter IS NULL OR fe2.property_id = property_filter)
                AND (category_filter IS NULL OR fe2.category = category_filter)
            GROUP BY fe2.category
        ) cat_summary) as category_breakdown,
        
        -- Property breakdown
        (SELECT json_agg(
            json_build_object(
                'property_id', property_id,
                'property_name', property_name,
                'amount', total_amount,
                'count', expense_count,
                'percentage', ROUND((total_amount / SUM(fe.amount) * 100)::numeric, 2)
            ) ORDER BY total_amount DESC
        ) FROM (
            SELECT 
                fe2.property_id,
                COALESCE(p.name, 'Unassigned') as property_name,
                SUM(fe2.amount) as total_amount,
                COUNT(*) as expense_count
            FROM finance_expenses fe2
            LEFT JOIN properties p ON fe2.property_id = p.id
            WHERE fe2.date BETWEEN date_filter_start AND date_filter_end
                AND fe2.approval_status = 'approved'
                AND (property_filter IS NULL OR fe2.property_id = property_filter)
                AND (category_filter IS NULL OR fe2.category = category_filter)
            GROUP BY fe2.property_id, p.name
        ) prop_summary) as property_breakdown,
        
        -- Monthly trend
        (SELECT json_agg(
            json_build_object(
                'month', month_year,
                'amount', total_amount,
                'count', expense_count
            ) ORDER BY month_year
        ) FROM (
            SELECT 
                TO_CHAR(DATE_TRUNC('month', fe2.date), 'YYYY-MM') as month_year,
                SUM(fe2.amount) as total_amount,
                COUNT(*) as expense_count
            FROM finance_expenses fe2
            WHERE fe2.date BETWEEN date_filter_start AND date_filter_end
                AND fe2.approval_status = 'approved'
                AND (property_filter IS NULL OR fe2.property_id = property_filter)
                AND (category_filter IS NULL OR fe2.category = category_filter)
            GROUP BY DATE_TRUNC('month', fe2.date)
            ORDER BY DATE_TRUNC('month', fe2.date)
        ) monthly_summary) as monthly_trend
        
    FROM finance_expenses fe
    WHERE fe.date BETWEEN date_filter_start AND date_filter_end
        AND fe.approval_status = 'approved'
        AND (property_filter IS NULL OR fe.property_id = property_filter)
        AND (category_filter IS NULL OR fe.category = category_filter);
END;
$$ LANGUAGE plpgsql;

-- Function to get profit & loss data for a date range
CREATE OR REPLACE FUNCTION get_profit_loss_data(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    period DATE,
    revenue DECIMAL(15,2),
    expenses DECIMAL(15,2),
    gross_profit DECIMAL(15,2),
    net_profit DECIMAL(15,2),
    profit_margin DECIMAL(5,2),
    revenue_growth DECIMAL(5,2),
    expense_growth DECIMAL(5,2)
) AS $$
DECLARE
    date_filter_start DATE;
    date_filter_end DATE;
BEGIN
    -- Set default date range if not provided (last 12 months)
    date_filter_start := COALESCE(start_date, CURRENT_DATE - INTERVAL '12 months');
    date_filter_end := COALESCE(end_date, CURRENT_DATE);
    
    RETURN QUERY
    WITH monthly_data AS (
        SELECT 
            pls.period::DATE,
            pls.total_revenue,
            pls.total_expenses,
            pls.total_revenue as gross_profit, -- Assuming no COGS for now
            pls.net_profit,
            pls.profit_margin_percentage,
            LAG(pls.total_revenue) OVER (ORDER BY pls.period) as prev_revenue,
            LAG(pls.total_expenses) OVER (ORDER BY pls.period) as prev_expenses
        FROM finance_profit_loss_summary pls
        WHERE pls.period BETWEEN date_filter_start AND date_filter_end
        ORDER BY pls.period
    )
    SELECT 
        md.period,
        md.total_revenue::DECIMAL(15,2),
        md.total_expenses::DECIMAL(15,2),
        md.gross_profit::DECIMAL(15,2),
        md.net_profit::DECIMAL(15,2),
        md.profit_margin_percentage::DECIMAL(5,2),
        CASE 
            WHEN md.prev_revenue > 0 THEN 
                ROUND(((md.total_revenue - md.prev_revenue) / md.prev_revenue * 100)::numeric, 2)
            ELSE 0 
        END::DECIMAL(5,2) as revenue_growth,
        CASE 
            WHEN md.prev_expenses > 0 THEN 
                ROUND(((md.total_expenses - md.prev_expenses) / md.prev_expenses * 100)::numeric, 2)
            ELSE 0 
        END::DECIMAL(5,2) as expense_growth
    FROM monthly_data md
    ORDER BY md.period;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate revenue forecasting
CREATE OR REPLACE FUNCTION get_revenue_forecast(
    forecast_months INTEGER DEFAULT 6
)
RETURNS TABLE (
    forecast_period DATE,
    projected_revenue DECIMAL(15,2),
    confidence_level DECIMAL(5,2),
    growth_rate DECIMAL(5,2),
    seasonal_factor DECIMAL(5,2)
) AS $$
DECLARE
    avg_growth_rate DECIMAL(5,2);
    seasonal_adjustment DECIMAL(5,2);
    base_revenue DECIMAL(15,2);
BEGIN
    -- Calculate average growth rate from last 12 months
    SELECT 
        AVG(
            CASE 
                WHEN LAG(total_revenue) OVER (ORDER BY period) > 0 THEN
                    (total_revenue - LAG(total_revenue) OVER (ORDER BY period)) / 
                    LAG(total_revenue) OVER (ORDER BY period) * 100
                ELSE 0
            END
        )::DECIMAL(5,2)
    INTO avg_growth_rate
    FROM finance_profit_loss_summary
    WHERE period >= CURRENT_DATE - INTERVAL '12 months'
    ORDER BY period;
    
    -- Get the most recent month's revenue as base
    SELECT total_revenue::DECIMAL(15,2)
    INTO base_revenue
    FROM finance_profit_loss_summary
    ORDER BY period DESC
    LIMIT 1;
    
    -- Set defaults if no data
    avg_growth_rate := COALESCE(avg_growth_rate, 0);
    base_revenue := COALESCE(base_revenue, 0);
    
    RETURN QUERY
    SELECT 
        (DATE_TRUNC('month', CURRENT_DATE) + (generate_series(1, forecast_months) || ' month')::INTERVAL)::DATE as forecast_period,
        (base_revenue * POWER(1 + (avg_growth_rate / 100), generate_series(1, forecast_months)))::DECIMAL(15,2) as projected_revenue,
        GREATEST(50, 95 - (generate_series(1, forecast_months) * 5))::DECIMAL(5,2) as confidence_level, -- Decreasing confidence over time
        avg_growth_rate as growth_rate,
        1.0::DECIMAL(5,2) as seasonal_factor -- Placeholder for seasonal adjustments
    FROM generate_series(1, forecast_months);
END;
$$ LANGUAGE plpgsql;

-- Function to get top expense categories with budget comparison
CREATE OR REPLACE FUNCTION get_expense_category_analysis(
    analysis_period INTEGER DEFAULT 12 -- months
)
RETURNS TABLE (
    category expense_category,
    current_month_amount DECIMAL(15,2),
    avg_monthly_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    transaction_count BIGINT,
    month_over_month_change DECIMAL(5,2),
    trend_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH category_data AS (
        SELECT 
            fe.category,
            SUM(CASE WHEN DATE_TRUNC('month', fe.date) = DATE_TRUNC('month', CURRENT_DATE) 
                     THEN fe.amount ELSE 0 END) as current_month,
            AVG(monthly_amounts.monthly_total) as avg_monthly,
            SUM(fe.amount) as total_amount,
            COUNT(*) as transaction_count,
            SUM(CASE WHEN DATE_TRUNC('month', fe.date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
                     THEN fe.amount ELSE 0 END) as last_month
        FROM finance_expenses fe
        LEFT JOIN (
            SELECT 
                category,
                DATE_TRUNC('month', date) as month,
                SUM(amount) as monthly_total
            FROM finance_expenses
            WHERE date >= CURRENT_DATE - (analysis_period || ' months')::INTERVAL
                AND approval_status = 'approved'
            GROUP BY category, DATE_TRUNC('month', date)
        ) monthly_amounts ON fe.category = monthly_amounts.category
        WHERE fe.date >= CURRENT_DATE - (analysis_period || ' months')::INTERVAL
            AND fe.approval_status = 'approved'
        GROUP BY fe.category
    )
    SELECT 
        cd.category,
        cd.current_month::DECIMAL(15,2),
        cd.avg_monthly::DECIMAL(15,2),
        cd.total_amount::DECIMAL(15,2),
        cd.transaction_count::BIGINT,
        CASE 
            WHEN cd.last_month > 0 THEN 
                ROUND(((cd.current_month - cd.last_month) / cd.last_month * 100)::numeric, 2)
            ELSE 0 
        END::DECIMAL(5,2) as month_over_month_change,
        CASE 
            WHEN cd.last_month > 0 AND cd.current_month > cd.last_month THEN 'increasing'
            WHEN cd.last_month > 0 AND cd.current_month < cd.last_month THEN 'decreasing'
            ELSE 'stable'
        END as trend_direction
    FROM category_data cd
    ORDER BY cd.total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION refresh_all_finance_views() TO authenticated;
GRANT EXECUTE ON FUNCTION get_expense_analytics(DATE, DATE, UUID, expense_category) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profit_loss_data(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_forecast(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expense_category_analysis(INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION refresh_all_finance_views() IS 'Refreshes all finance materialized views for updated analytics';
COMMENT ON FUNCTION get_expense_analytics(DATE, DATE, UUID, expense_category) IS 'Returns comprehensive expense analytics with breakdowns and trends';
COMMENT ON FUNCTION get_profit_loss_data(DATE, DATE) IS 'Returns profit & loss data with growth calculations for specified date range';
COMMENT ON FUNCTION get_revenue_forecast(INTEGER) IS 'Generates revenue forecasts based on historical trends';
COMMENT ON FUNCTION get_expense_category_analysis(INTEGER) IS 'Analyzes expense categories with trends and budget comparisons';