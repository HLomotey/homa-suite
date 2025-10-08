-- Ensure finance_expenses table exists and is properly configured

-- Create finance_expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS finance_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(100) NOT NULL,
    payee VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    property_id UUID,
    department VARCHAR(100),
    description TEXT,
    receipt_url TEXT,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finance_expenses_company ON finance_expenses(company);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_category ON finance_expenses(category);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_date ON finance_expenses(date);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_type ON finance_expenses(type);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_approval_status ON finance_expenses(approval_status);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_created_by ON finance_expenses(created_by);

-- Enable RLS
ALTER TABLE finance_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view finance expenses" ON finance_expenses;
    DROP POLICY IF EXISTS "Users can create finance expenses" ON finance_expenses;
    DROP POLICY IF EXISTS "Users can update finance expenses" ON finance_expenses;
    DROP POLICY IF EXISTS "Users can delete finance expenses" ON finance_expenses;
    
    -- Create new policies
    CREATE POLICY "Users can view finance expenses" 
    ON finance_expenses FOR SELECT 
    USING (auth.role() = 'authenticated');

    CREATE POLICY "Users can create finance expenses" 
    ON finance_expenses FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Users can update finance expenses" 
    ON finance_expenses FOR UPDATE 
    USING (auth.role() = 'authenticated');

    CREATE POLICY "Users can delete finance expenses" 
    ON finance_expenses FOR DELETE 
    USING (auth.role() = 'authenticated');
END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_finance_expenses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_finance_expenses_timestamp ON finance_expenses;
CREATE TRIGGER update_finance_expenses_timestamp
    BEFORE UPDATE ON finance_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_finance_expenses_timestamp();

-- Create trigger for created_by
CREATE OR REPLACE FUNCTION set_finance_expenses_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_finance_expenses_created_by ON finance_expenses;
CREATE TRIGGER set_finance_expenses_created_by
    BEFORE INSERT ON finance_expenses
    FOR EACH ROW
    EXECUTE FUNCTION set_finance_expenses_created_by();

-- Grant permissions
GRANT ALL ON finance_expenses TO authenticated;

-- Add some sample data if the table is empty
INSERT INTO finance_expenses (company, date, type, payee, category, amount, description)
SELECT 
    'Sample Company',
    CURRENT_DATE,
    'Expense',
    'Sample Vendor',
    'Office Supplies',
    150.00,
    'Sample expense for testing'
WHERE NOT EXISTS (SELECT 1 FROM finance_expenses LIMIT 1);

-- Add more sample data for better testing
INSERT INTO finance_expenses (company, date, type, payee, category, subcategory, amount, description)
SELECT * FROM (VALUES
    ('BOH Concepts', CURRENT_DATE - INTERVAL '1 day', 'Expense', 'Office Depot', 'Office Supplies', 'Stationery', 89.50, 'Monthly office supplies'),
    ('BOH Concepts', CURRENT_DATE - INTERVAL '2 days', 'Expense', 'Verizon', 'Utilities', 'Internet', 299.99, 'Monthly internet service'),
    ('BOH Concepts', CURRENT_DATE - INTERVAL '3 days', 'Expense', 'Shell Gas Station', 'Transportation', 'Fuel', 75.25, 'Vehicle fuel'),
    ('BOH Concepts', CURRENT_DATE - INTERVAL '5 days', 'Expense', 'Amazon Business', 'Equipment', 'Computer Hardware', 1250.00, 'New laptop for staff'),
    ('BOH Concepts', CURRENT_DATE - INTERVAL '7 days', 'Expense', 'Local Restaurant', 'Meals & Entertainment', 'Client Meeting', 185.75, 'Client lunch meeting')
) AS sample_data(company, date, type, payee, category, subcategory, amount, description)
WHERE NOT EXISTS (SELECT 1 FROM finance_expenses WHERE company = 'BOH Concepts' LIMIT 1);

-- Add comments
COMMENT ON TABLE finance_expenses IS 'Tracks company expenses and financial expenditures';
COMMENT ON COLUMN finance_expenses.company IS 'Company or entity that incurred the expense';
COMMENT ON COLUMN finance_expenses.date IS 'Date when the expense was incurred';
COMMENT ON COLUMN finance_expenses.type IS 'Type of expense (e.g., Expense, Reimbursement, etc.)';
COMMENT ON COLUMN finance_expenses.payee IS 'Vendor or person who received the payment';
COMMENT ON COLUMN finance_expenses.category IS 'Expense category for reporting and analysis';
COMMENT ON COLUMN finance_expenses.subcategory IS 'More specific subcategory within the main category';
COMMENT ON COLUMN finance_expenses.amount IS 'Total amount of the expense';
COMMENT ON COLUMN finance_expenses.currency IS 'Currency code (default USD)';
COMMENT ON COLUMN finance_expenses.property_id IS 'Associated property if expense is property-specific';
COMMENT ON COLUMN finance_expenses.department IS 'Department that incurred the expense';
COMMENT ON COLUMN finance_expenses.description IS 'Additional details about the expense';
COMMENT ON COLUMN finance_expenses.receipt_url IS 'URL to receipt or invoice document';
COMMENT ON COLUMN finance_expenses.approval_status IS 'Current approval status of the expense';
COMMENT ON COLUMN finance_expenses.approved_by IS 'User who approved the expense';
COMMENT ON COLUMN finance_expenses.approved_at IS 'Timestamp when expense was approved';