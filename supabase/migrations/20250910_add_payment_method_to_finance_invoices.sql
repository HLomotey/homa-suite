-- Add payment_method column to finance_invoices table
-- This column is needed for payment method analytics in the finance dashboard

-- Add payment_method column
ALTER TABLE finance_invoices 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add index for payment_method for better query performance
CREATE INDEX IF NOT EXISTS idx_finance_invoices_payment_method ON finance_invoices(payment_method);

-- Add comment to the new column
COMMENT ON COLUMN finance_invoices.payment_method IS 'Payment method used for the invoice (e.g., cash, check, bank_transfer, credit_card, etc.)';

-- Update existing records with a default payment method where null
UPDATE finance_invoices 
SET payment_method = 'unknown' 
WHERE payment_method IS NULL;
