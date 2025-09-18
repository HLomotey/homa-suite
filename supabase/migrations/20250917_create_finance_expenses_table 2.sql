-- Create expense_category enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category') THEN
        CREATE TYPE expense_category AS ENUM (
            'maintenance', 
            'utilities', 
            'insurance', 
            'property_management', 
            'marketing', 
            'legal_professional', 
            'office_supplies', 
            'travel', 
            'meals_entertainment', 
            'repairs', 
            'cleaning', 
            'landscaping', 
            'security', 
            'taxes', 
            'other'
        );
    END IF;
END $$;

-- Create approval_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- Create finance_expenses table
CREATE TABLE IF NOT EXISTS finance_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(100) DEFAULT 'Expense',
    payee VARCHAR(255) NOT NULL,
    category expense_category NOT NULL DEFAULT 'other',
    subcategory VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    property_id UUID REFERENCES properties(id),
    department VARCHAR(100),
    description TEXT,
    receipt_url VARCHAR(500),
    approval_status approval_status DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_finance_expenses_date ON finance_expenses(date);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_category ON finance_expenses(category);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_property_id ON finance_expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_approval_status ON finance_expenses(approval_status);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_company ON finance_expenses(company);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_created_at ON finance_expenses(created_at);

-- Add composite indexes for common query combinations
CREATE INDEX IF NOT EXISTS idx_finance_expenses_date_category ON finance_expenses(date, category);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_property_date ON finance_expenses(property_id, date);

-- Add RLS policies
ALTER TABLE finance_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view all expenses
CREATE POLICY finance_expenses_select_policy ON finance_expenses
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to insert expenses
CREATE POLICY finance_expenses_insert_policy ON finance_expenses
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy for authenticated users to update expenses
CREATE POLICY finance_expenses_update_policy ON finance_expenses
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create policy for authenticated users to delete expenses
CREATE POLICY finance_expenses_delete_policy ON finance_expenses
    FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_finance_expenses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_finance_expenses_timestamp
    BEFORE UPDATE ON finance_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_finance_expenses_timestamp();

-- Create trigger for approval timestamp
CREATE OR REPLACE FUNCTION update_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval_status = 'approved' AND OLD.approval_status != 'approved' THEN
        NEW.approved_at = NOW();
    ELSIF NEW.approval_status != 'approved' THEN
        NEW.approved_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expense_approval_timestamp
    BEFORE UPDATE ON finance_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_timestamp();

-- Add comment to table
COMMENT ON TABLE finance_expenses IS 'Stores expense data for financial tracking, budgeting, and P&L analysis';
COMMENT ON COLUMN finance_expenses.category IS 'Expense category for reporting and analysis';
COMMENT ON COLUMN finance_expenses.property_id IS 'Optional reference to specific property for property-based expense tracking';
COMMENT ON COLUMN finance_expenses.approval_status IS 'Approval workflow status for expense management';