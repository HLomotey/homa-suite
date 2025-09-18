-- Create enum for payment status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_payment_status') THEN
    CREATE TYPE billing_payment_status AS ENUM ('unpaid','partial','paid','waived');
  END IF;
END$$;

-- Billing table based on assignments schema
CREATE TABLE IF NOT EXISTS public.billing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NULL,
  property_id uuid NOT NULL,
  property_name text NOT NULL,
  room_id uuid NOT NULL,
  room_name text NOT NULL,
  rent_amount numeric NOT NULL,
  payment_status billing_payment_status NOT NULL DEFAULT 'unpaid',
  period_start date NOT NULL,
  period_end date NOT NULL,
  start_date date NOT NULL,
  end_date date NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NULL,
  CONSTRAINT billing_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- FK references based on assignments schema
ALTER TABLE public.billing
  ADD CONSTRAINT billing_tenant_fk
  FOREIGN KEY (tenant_id) REFERENCES public.external_staff(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE public.billing
  ADD CONSTRAINT billing_property_fk
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public.billing
  ADD CONSTRAINT billing_room_fk
  FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_billing_tenant_id ON public.billing USING btree (tenant_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_billing_property_id ON public.billing USING btree (property_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_billing_room_id ON public.billing USING btree (room_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_billing_period ON public.billing USING btree (period_start, period_end) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_billing_payment_status ON public.billing USING btree (payment_status) TABLESPACE pg_default;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_billing_updated_at ON public.billing;
CREATE TRIGGER trg_billing_updated_at
BEFORE UPDATE ON public.billing
FOR EACH ROW EXECUTE PROCEDURE public.set_timestamp_updated_at();

-- Add unique constraint for idempotent upserts
ALTER TABLE public.billing
  ADD CONSTRAINT billing_tenant_period_unique 
  UNIQUE (tenant_id, period_start, period_end);

-- Activity log trigger (matching assignments pattern)
CREATE TRIGGER activity_log_trigger_billing
AFTER INSERT OR DELETE OR UPDATE ON public.billing 
FOR EACH ROW EXECUTE FUNCTION log_activity();

-- OPTIONAL: Backfill from assignments table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='assignments'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='external_staff'
  ) THEN
    INSERT INTO public.billing (
      tenant_id, property_id, property_name, room_id, room_name,
      rent_amount, payment_status, period_start, period_end, start_date, end_date
    )
    SELECT DISTINCT
      a.tenant_id,
      a.property_id,
      a.property_name,
      a.room_id,
      a.room_name,
      a.rent_amount,
      CASE 
        WHEN a.payment_status = 'Paid' THEN 'paid'::billing_payment_status
        WHEN a.payment_status = 'Partial' THEN 'partial'::billing_payment_status
        WHEN a.payment_status = 'Overdue' THEN 'unpaid'::billing_payment_status
        ELSE 'unpaid'::billing_payment_status
      END,
      date_trunc('month', COALESCE(a.start_date, now()))::date AS period_start,
      (date_trunc('month', COALESCE(a.start_date, now())) + interval '1 month - 1 day')::date AS period_end,
      a.start_date,
      a.end_date
    FROM public.assignments a
    INNER JOIN public.external_staff es ON es.id = a.tenant_id
    WHERE a.tenant_id IS NOT NULL
      AND (es."POSITION STATUS" = 'Active' OR es."POSITION STATUS" IS NULL)
      AND (es."TERMINATION DATE" IS NULL OR 
           es."TERMINATION DATE"::date >= date_trunc('month', COALESCE(a.start_date, now()))::date)
    ON CONFLICT (tenant_id, period_start, period_end) DO NOTHING;
  END IF;
END $$;

-- Create function for upserting billing records
CREATE OR REPLACE FUNCTION upsert_billing_record(
  p_tenant_id UUID,
  p_property_id UUID,
  p_property_name TEXT,
  p_room_id UUID,
  p_room_name TEXT,
  p_rent_amount DECIMAL(10,2),
  p_payment_status billing_payment_status,
  p_period_start DATE,
  p_period_end DATE,
  p_start_date DATE,
  p_end_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.billing (
    tenant_id, property_id, property_name, room_id, room_name,
    rent_amount, payment_status, period_start, period_end, start_date, end_date
  ) VALUES (
    p_tenant_id, p_property_id, p_property_name, p_room_id, p_room_name,
    p_rent_amount, p_payment_status, p_period_start, p_period_end, p_start_date, p_end_date
  )
  ON CONFLICT (tenant_id, period_start, period_end) 
  DO UPDATE SET
    property_id = EXCLUDED.property_id,
    property_name = EXCLUDED.property_name,
    room_id = EXCLUDED.room_id,
    room_name = EXCLUDED.room_name,
    rent_amount = EXCLUDED.rent_amount,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
