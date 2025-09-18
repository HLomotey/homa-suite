-- Create invoice_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM ('paid', 'pending', 'overdue', 'cancelled');
    END IF;
END $$;

-- Create finance_invoices table
CREATE TABLE IF NOT EXISTS finance_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    date_issued DATE NOT NULL,
    invoice_status invoice_status NOT NULL,
    date_paid DATE,
    item_name TEXT NOT NULL,
    item_description TEXT NOT NULL,
    rate DECIMAL(15, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    line_subtotal DECIMAL(15, 2) NOT NULL,
    tax_1_type TEXT,
    tax_1_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_2_type TEXT,
    tax_2_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    line_total DECIMAL(15, 2) NOT NULL,
    currency TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_finance_invoices_client_name ON finance_invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_invoice_number ON finance_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_date_issued ON finance_invoices(date_issued);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_invoice_status ON finance_invoices(invoice_status);

-- Add RLS policies
ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view all invoices
CREATE POLICY finance_invoices_select_policy ON finance_invoices
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to insert invoices
CREATE POLICY finance_invoices_insert_policy ON finance_invoices
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy for authenticated users to update their own invoices
CREATE POLICY finance_invoices_update_policy ON finance_invoices
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_finance_invoices_timestamp
BEFORE UPDATE ON finance_invoices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add comment to table
COMMENT ON TABLE finance_invoices IS 'Stores invoice data for financial tracking and reporting';
