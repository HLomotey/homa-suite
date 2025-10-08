-- Create the finance_monthly_summary view that useFinanceAnalytics expects
-- This view provides monthly aggregated finance data for the analytics dashboard

CREATE OR REPLACE VIEW finance_monthly_summary AS
SELECT 
    EXTRACT(YEAR FROM period_month)::integer as year,
    EXTRACT(MONTH FROM period_month)::integer as month,
    period_month as month_start,
    
    -- Invoice counts
    COALESCE(SUM(total_invoices), 0)::integer as total_invoices,
    COALESCE(SUM(paid_invoices), 0)::integer as paid_invoices,
    COALESCE(SUM(sent_invoices), 0)::integer as sent_invoices,
    COALESCE(SUM(overdue_invoices), 0)::integer as overdue_invoices,
    COALESCE(SUM(cancelled_invoices), 0)::integer as cancelled_invoices,
    
    -- Revenue amounts
    COALESCE(SUM(total_invoiced), 0)::numeric as total_invoiced,
    COALESCE(SUM(total_revenue), 0)::numeric as total_revenue,
    COALESCE(SUM(outstanding_revenue), 0)::numeric as outstanding_revenue,
    
    -- Calculated metrics
    CASE 
        WHEN SUM(total_invoices) > 0 THEN 
            COALESCE(SUM(total_revenue) / SUM(total_invoices), 0)
        ELSE 0 
    END::numeric as average_invoice_value,
    
    CASE 
        WHEN SUM(paid_invoices) > 0 THEN 
            COALESCE(SUM(total_revenue) / SUM(paid_invoices), 0)
        ELSE 0 
    END::numeric as average_paid_invoice,
    
    CASE 
        WHEN SUM(total_invoiced) > 0 THEN 
            COALESCE((SUM(total_revenue) / SUM(total_invoiced)) * 100, 0)
        ELSE 0 
    END::numeric as collection_rate,
    
    COALESCE(COUNT(DISTINCT client_name), 0)::integer as unique_clients

FROM (
    -- Aggregate invoice data by month and client
    SELECT 
        DATE_TRUNC('month', COALESCE(fi.date_paid, fi.date_issued)) as period_month,
        fi.client_name,
        
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN fi.invoice_status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN fi.invoice_status = 'sent' THEN 1 END) as sent_invoices,
        COUNT(CASE WHEN fi.invoice_status = 'overdue' THEN 1 END) as overdue_invoices,
        COUNT(CASE WHEN fi.invoice_status = 'cancelled' THEN 1 END) as cancelled_invoices,
        
        SUM(fi.line_total) as total_invoiced,
        SUM(CASE 
            WHEN fi.invoice_status = 'paid' AND fi.date_paid IS NOT NULL 
            THEN fi.line_total 
            ELSE 0 
        END) as total_revenue,
        SUM(CASE 
            WHEN fi.invoice_status IN ('sent', 'overdue', 'pending') 
            THEN fi.line_total 
            ELSE 0 
        END) as outstanding_revenue
        
    FROM finance_invoices fi
    WHERE fi.date_issued >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '24 months')
    GROUP BY 
        DATE_TRUNC('month', COALESCE(fi.date_paid, fi.date_issued)),
        fi.client_name
) monthly_data
GROUP BY period_month
ORDER BY period_month DESC;

-- Create the finance_analytics_view that provides detailed invoice data
CREATE OR REPLACE VIEW finance_analytics_view AS
SELECT 
    fi.id,
    fi.client_name,
    fi.invoice_number,
    fi.date_issued,
    fi.invoice_status,
    fi.date_paid,
    fi.line_total,
    fi.currency,
    
    -- Calculated fields for analytics
    EXTRACT(YEAR FROM fi.date_issued)::integer as issue_year,
    EXTRACT(MONTH FROM fi.date_issued)::integer as issue_month,
    
    -- Days to payment (for paid invoices)
    CASE 
        WHEN fi.invoice_status = 'paid' AND fi.date_paid IS NOT NULL 
        THEN EXTRACT(DAY FROM (fi.date_paid - fi.date_issued))::integer
        ELSE NULL 
    END as days_to_payment,
    
    -- Days overdue (for overdue invoices)
    CASE 
        WHEN fi.invoice_status = 'overdue' 
        THEN EXTRACT(DAY FROM (CURRENT_DATE - fi.date_issued))::integer
        ELSE NULL 
    END as days_overdue,
    
    -- Status category for grouping
    CASE 
        WHEN fi.invoice_status = 'paid' THEN 'collected'
        WHEN fi.invoice_status IN ('sent', 'pending') THEN 'outstanding'
        WHEN fi.invoice_status = 'overdue' THEN 'overdue'
        ELSE 'other'
    END as status_category,
    
    -- Revenue recognition (cash basis)
    CASE 
        WHEN fi.invoice_status = 'paid' AND fi.date_paid IS NOT NULL 
        THEN fi.line_total 
        ELSE 0 
    END as recognized_revenue,
    
    -- Outstanding amount
    CASE 
        WHEN fi.invoice_status IN ('sent', 'overdue', 'pending') 
        THEN fi.line_total 
        ELSE 0 
    END as outstanding_amount,
    
    -- Age bucket for aging analysis
    CASE 
        WHEN fi.invoice_status = 'paid' THEN 'paid'
        WHEN fi.invoice_status IN ('sent', 'pending') AND 
             EXTRACT(DAY FROM (CURRENT_DATE - fi.date_issued)) <= 30 THEN '0-30 days'
        WHEN fi.invoice_status IN ('sent', 'pending') AND 
             EXTRACT(DAY FROM (CURRENT_DATE - fi.date_issued)) <= 60 THEN '31-60 days'
        WHEN fi.invoice_status IN ('sent', 'pending') AND 
             EXTRACT(DAY FROM (CURRENT_DATE - fi.date_issued)) <= 90 THEN '61-90 days'
        WHEN fi.invoice_status = 'overdue' OR 
             EXTRACT(DAY FROM (CURRENT_DATE - fi.date_issued)) > 90 THEN '90+ days'
        ELSE 'other'
    END as age_bucket

FROM finance_invoices fi
ORDER BY fi.date_issued DESC;

-- Grant permissions
GRANT SELECT ON finance_monthly_summary TO authenticated;
GRANT SELECT ON finance_analytics_view TO authenticated;

-- Add helpful comments
COMMENT ON VIEW finance_monthly_summary IS 'Monthly aggregated finance metrics for dashboard analytics';
COMMENT ON VIEW finance_analytics_view IS 'Detailed invoice analytics with calculated fields for reporting';
