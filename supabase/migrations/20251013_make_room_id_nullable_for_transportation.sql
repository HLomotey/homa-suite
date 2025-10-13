-- Make room_id nullable for transportation billing
-- Transportation billing doesn't require housing assignment

-- Drop the existing NOT NULL constraint on room_id
ALTER TABLE public.billing 
ALTER COLUMN room_id DROP NOT NULL;

-- Update the foreign key constraint to handle NULL values properly
ALTER TABLE public.billing
DROP CONSTRAINT IF EXISTS billing_room_fk;

ALTER TABLE public.billing
ADD CONSTRAINT billing_room_fk
FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Add a check constraint to ensure room_id is required for housing billing but optional for transportation
ALTER TABLE public.billing
ADD CONSTRAINT billing_room_id_check 
CHECK (
  (billing_type = 'housing' AND room_id IS NOT NULL) OR 
  (billing_type != 'housing')
);

-- Add property_name and room_name columns back if they don't exist (they were removed in a previous migration)
-- Make them nullable since transportation doesn't need room_name
ALTER TABLE public.billing 
ADD COLUMN IF NOT EXISTS property_name TEXT;

ALTER TABLE public.billing 
ADD COLUMN IF NOT EXISTS room_name TEXT;

-- Add comment for documentation
COMMENT ON CONSTRAINT billing_room_id_check ON billing IS 'Ensures room_id is required for housing billing but optional for transportation billing';

-- Update the billing view to handle NULL room values
CREATE OR REPLACE VIEW public.billing_with_details AS
SELECT 
    b.id,
    b.tenant_id,
    b.property_id,
    b.room_id,
    b.rent_amount,
    b.payment_status,
    b.billing_type,
    b.period_start,
    b.period_end,
    b.start_date,
    b.end_date,
    b.total_deductions,
    b.processed_deductions,
    b.deduction_status,
    b.completion_date,
    b.created_at,
    b.updated_at,
    es."PAYROLL FIRST NAME" as staff_first_name,
    es."PAYROLL LAST NAME" as staff_last_name,
    p.title as property_name,
    COALESCE(r.name, 'N/A') as room_name,
    COUNT(bd.id) as deduction_count,
    COALESCE(SUM(COALESCE(bd.actual_amount, bd.scheduled_amount)), 0) as total_deduction_amount
FROM billing b
LEFT JOIN external_staff es ON b.tenant_id = es.id
LEFT JOIN properties p ON b.property_id = p.id
LEFT JOIN rooms r ON b.room_id = r.id
LEFT JOIN billing_deductions bd ON b.id = bd.billing_id
GROUP BY b.id, b.tenant_id, b.property_id, b.room_id, b.rent_amount, 
         b.payment_status, b.billing_type, b.period_start, b.period_end,
         b.start_date, b.end_date, b.total_deductions, b.processed_deductions,
         b.deduction_status, b.completion_date, b.created_at, b.updated_at,
         es."PAYROLL FIRST NAME", es."PAYROLL LAST NAME", p.title, r.name;
