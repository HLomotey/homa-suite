-- Create updated_at triggers for security deposit tables
-- Migration: 20250914_004_create_updated_at_triggers.sql

-- Generic function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for security_deposits table
CREATE TRIGGER trigger_security_deposits_updated_at
  BEFORE UPDATE ON security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for security_deposit_deductions table
CREATE TRIGGER trigger_deductions_updated_at
  BEFORE UPDATE ON security_deposit_deductions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add function comment
COMMENT ON FUNCTION update_updated_at_column() IS 'Generic function to automatically update updated_at timestamp on row updates';
