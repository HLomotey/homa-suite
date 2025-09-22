-- Create RPC function to get total finance invoices amount
-- This replaces the malformed sum query that was causing 400 errors
-- Created: 2025-09-08

CREATE OR REPLACE FUNCTION get_finance_invoices_total()
RETURNS NUMERIC AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(line_total) FROM finance_invoices WHERE line_total IS NOT NULL),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_finance_invoices_total() TO authenticated;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_finance_invoices_total() TO service_role;
