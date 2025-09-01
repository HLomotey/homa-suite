-- Remove property_name and room_name from billing table to normalize schema
-- Keep only property_id and room_id for proper foreign key relationships

-- Drop the upsert function first
DROP FUNCTION IF EXISTS upsert_billing_record(UUID, UUID, TEXT, UUID, TEXT, DECIMAL, billing_payment_status, DATE, DATE, DATE, DATE);

-- Remove property_name and room_name columns
ALTER TABLE public.billing DROP COLUMN IF EXISTS property_name;
ALTER TABLE public.billing DROP COLUMN IF EXISTS room_name;

-- Recreate upsert function without property_name and room_name
CREATE OR REPLACE FUNCTION upsert_billing_record(
  p_tenant_id UUID,
  p_property_id UUID,
  p_room_id UUID,
  p_rent_amount DECIMAL(10,2),
  p_payment_status billing_payment_status,
  p_period_start DATE,
  p_period_end DATE,
  p_start_date DATE,
  p_end_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.billing (
    tenant_id, property_id, room_id,
    rent_amount, payment_status, period_start, period_end, start_date, end_date
  ) VALUES (
    p_tenant_id, p_property_id, p_room_id,
    p_rent_amount, p_payment_status, p_period_start, p_period_end, p_start_date, p_end_date
  )
  ON CONFLICT (tenant_id, period_start, period_end) 
  DO UPDATE SET
    property_id = EXCLUDED.property_id,
    room_id = EXCLUDED.room_id,
    rent_amount = EXCLUDED.rent_amount,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
