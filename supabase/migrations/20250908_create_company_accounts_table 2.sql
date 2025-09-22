-- Create company_accounts table
-- This table stores company account names with integer IDs

CREATE TABLE IF NOT EXISTS company_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_accounts_name ON company_accounts(name);
CREATE INDEX IF NOT EXISTS idx_company_accounts_created_at ON company_accounts(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE company_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for company_accounts
CREATE POLICY "Users can view company accounts" ON company_accounts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert company accounts" ON company_accounts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update company accounts" ON company_accounts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete company accounts" ON company_accounts
    FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_accounts_updated_at
    BEFORE UPDATE ON company_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE company_accounts IS 'Stores company account names with integer IDs';
COMMENT ON COLUMN company_accounts.id IS 'Primary key - integer ID for the company account';
COMMENT ON COLUMN company_accounts.name IS 'Company account name - must be unique';
COMMENT ON COLUMN company_accounts.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN company_accounts.updated_at IS 'Timestamp when the record was last updated';
