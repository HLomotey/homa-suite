-- Add 'sent' to the invoice_status enum
ALTER TYPE invoice_status ADD VALUE 'sent';

-- Add comment explaining the updated enum values
COMMENT ON TYPE invoice_status IS 'Valid invoice status values: paid, pending, overdue, cancelled, sent';
