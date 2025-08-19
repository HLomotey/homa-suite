-- Update utility_setups table to add billing period, date, and amount fields
ALTER TABLE utility_setups
ADD COLUMN billing_period_id UUID REFERENCES billing_periods(id),
ADD COLUMN billing_date DATE,
ADD COLUMN billing_amount DECIMAL(10, 2);

-- Add comment to the new columns
COMMENT ON COLUMN utility_setups.billing_period_id IS 'Reference to the billing period';
COMMENT ON COLUMN utility_setups.billing_date IS 'Date of billing';
COMMENT ON COLUMN utility_setups.billing_amount IS 'Amount on bill';
