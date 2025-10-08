-- 2025-09-19 Fix database schema issues observed in console
-- 1) Standardize finance_expenses date column to lowercase
-- 2) Add missing updated_by column used by trigger, or fix trigger
-- 3) Ensure operations_job_orders_analytics view exists
-- 4) Add compatibility user_roles view so permissions RPC works
-- 5) Ensure permissions RPC exists and is granted

-- 1) Standardize finance_expenses.date
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'finance_expenses' 
      AND column_name = 'Date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'finance_expenses' 
      AND column_name = 'date'
  ) THEN
    EXECUTE 'ALTER TABLE public.finance_expenses RENAME COLUMN "Date" TO date';
  END IF;
END $$;

-- 1b) Standardize other finance_expenses columns from quoted/camel to lowercase snake_case
DO $$
BEGIN
  -- Company -> company
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'Company'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'company'
  ) THEN
    EXECUTE 'ALTER TABLE public.finance_expenses RENAME COLUMN "Company" TO company';
  END IF;

  -- Type -> type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'Type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'type'
  ) THEN
    EXECUTE 'ALTER TABLE public.finance_expenses RENAME COLUMN "Type" TO type';
  END IF;

  -- Payee -> payee
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'Payee'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'payee'
  ) THEN
    EXECUTE 'ALTER TABLE public.finance_expenses RENAME COLUMN "Payee" TO payee';
  END IF;

  -- Category -> category
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'Category'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'category'
  ) THEN
    EXECUTE 'ALTER TABLE public.finance_expenses RENAME COLUMN "Category" TO category';
  END IF;

  -- Total -> amount
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'Total'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'amount'
  ) THEN
    EXECUTE 'ALTER TABLE public.finance_expenses RENAME COLUMN "Total" TO amount';
  END IF;
END $$;

-- 1c) Ensure amount column has expected numeric precision
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'finance_expenses' AND column_name = 'amount'
  ) THEN
    -- Standardize to DECIMAL(15,2)
    EXECUTE 'ALTER TABLE public.finance_expenses ALTER COLUMN amount TYPE DECIMAL(15,2) USING amount::DECIMAL(15,2)';
    -- Ensure NOT NULL
    EXECUTE 'ALTER TABLE public.finance_expenses ALTER COLUMN amount SET NOT NULL';
  END IF;
END $$;

-- 2) Ensure updated_by column exists (referenced by trigger)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'finance_expenses' 
      AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE public.finance_expenses ADD COLUMN updated_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 2b) Ensure primary key exists on id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'finance_expenses' AND c.contype = 'p'
  ) THEN
    EXECUTE 'ALTER TABLE public.finance_expenses ADD CONSTRAINT finance_expenses_pkey PRIMARY KEY (id)';
  END IF;
END $$;

-- Recreate safe trigger function that sets updated_at and updated_by if present
CREATE OR REPLACE FUNCTION public.update_finance_expenses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  BEGIN
    NEW.updated_by = auth.uid();
  EXCEPTION WHEN undefined_column THEN
    -- Ignore if column doesn't exist
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove any conflicting generic updated_at triggers if present
DROP TRIGGER IF EXISTS update_finance_expenses_updated_at ON public.finance_expenses;
DROP TRIGGER IF EXISTS update_finance_expenses_timestamp ON public.finance_expenses;
CREATE TRIGGER update_finance_expenses_timestamp
  BEFORE UPDATE ON public.finance_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_expenses_timestamp();

-- 2c) Ensure created_by is set automatically on insert if column exists
CREATE OR REPLACE FUNCTION public.set_finance_expenses_created_by()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_finance_expenses_created_by ON public.finance_expenses;
CREATE TRIGGER set_finance_expenses_created_by
  BEFORE INSERT ON public.finance_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_finance_expenses_created_by();

-- 3) Ensure operations analytics views exist
CREATE OR REPLACE VIEW public.operations_job_orders_analytics AS
SELECT 
  COUNT(*) as total_job_orders,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as filled_orders,
  COUNT(*) FILTER (WHERE status IN ('APPROVED', 'IN_PROGRESS')) as open_orders,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders,
  COUNT(*) FILTER (WHERE status = 'ON_HOLD') as on_hold_orders,
  CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)) * 100 ELSE 0 END as fill_rate,
  CASE WHEN COUNT(*) FILTER (WHERE status != 'CANCELLED') > 0 THEN (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*) FILTER (WHERE status != 'CANCELLED')) * 100 ELSE 0 END as placement_rate,
  AVG(closed_at - created_at) FILTER (WHERE status = 'COMPLETED' AND closed_at IS NOT NULL) as avg_time_to_fill,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_orders,
  COUNT(*) FILTER (WHERE closed_at >= CURRENT_DATE - INTERVAL '30 days') as recent_fills,
  COUNT(*) FILTER (WHERE priority = 'URGENT') as urgent_orders,
  COUNT(*) FILTER (WHERE priority = 'HIGH') as high_priority_orders,
  COUNT(*) FILTER (WHERE priority = 'MEDIUM') as medium_priority_orders,
  COUNT(*) FILTER (WHERE priority = 'LOW') as low_priority_orders,
  COUNT(DISTINCT organization_id) as locations_with_orders,
  0 as departments_with_orders
FROM public.job_orders;

GRANT SELECT ON public.operations_job_orders_analytics TO authenticated;
COMMENT ON VIEW public.operations_job_orders_analytics IS 'Overall job orders analytics including fill rates and performance metrics';

-- 6) Recreate indexes on standardized column names
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='finance_expenses') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_finance_expenses_company ON public.finance_expenses (company)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_finance_expenses_date ON public.finance_expenses (date)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_finance_expenses_category ON public.finance_expenses (category)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_finance_expenses_payee ON public.finance_expenses (payee)';
  END IF;
END $$;

-- 7) Ensure RLS is enabled with permissive authenticated policies (adjust later as needed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='finance_expenses') THEN
    EXECUTE 'ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY';
    -- Create simple authenticated policies if they do not exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='finance_expenses' AND policyname='finance_expenses_select_authenticated'
    ) THEN
      EXECUTE 'CREATE POLICY finance_expenses_select_authenticated ON public.finance_expenses FOR SELECT TO authenticated USING (true)';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='finance_expenses' AND policyname='finance_expenses_insert_authenticated'
    ) THEN
      EXECUTE 'CREATE POLICY finance_expenses_insert_authenticated ON public.finance_expenses FOR INSERT TO authenticated WITH CHECK (true)';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='finance_expenses' AND policyname='finance_expenses_update_authenticated'
    ) THEN
      EXECUTE 'CREATE POLICY finance_expenses_update_authenticated ON public.finance_expenses FOR UPDATE TO authenticated USING (true)';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='finance_expenses' AND policyname='finance_expenses_delete_authenticated'
    ) THEN
      EXECUTE 'CREATE POLICY finance_expenses_delete_authenticated ON public.finance_expenses FOR DELETE TO authenticated USING (true)';
    END IF;
  END IF;
END $$;

-- 4) Create compatibility view for user_roles if table is missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    -- If a view/table named user_roles doesn't exist, create a view from profiles
    CREATE OR REPLACE VIEW public.user_roles AS
    SELECT p.id AS user_id, p.role_id AS role_id
    FROM public.profiles p
    WHERE p.role_id IS NOT NULL;
    COMMENT ON VIEW public.user_roles IS 'Compatibility view mapping profiles(id, role_id) as user_roles(user_id, role_id)';
  END IF;
END $$;

GRANT SELECT ON public.user_roles TO authenticated;

-- 5) Ensure get_user_effective_permissions RPC exists and is granted
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(p_user_id UUID) 
RETURNS TABLE(permission_name TEXT, resource TEXT, action TEXT) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name as permission_name,
                  p.resource as resource,
                  p.action as action
  FROM public.permissions p
  INNER JOIN public.role_permissions rp ON p.id = rp.permission_id
  INNER JOIN public.roles r ON rp.role_id = r.id
  INNER JOIN public.user_roles ur ON r.id = ur.role_id
  WHERE ur.user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_effective_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_effective_permissions(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_effective_permissions(UUID) TO anon;
