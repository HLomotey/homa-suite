-- Enable RLS on billing table
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all billing records
CREATE POLICY "billing_select_policy" ON public.billing
FOR SELECT TO authenticated
USING (true);

-- Policy for authenticated users to insert billing records
CREATE POLICY "billing_insert_policy" ON public.billing
FOR INSERT TO authenticated
WITH CHECK (true);

-- Policy for authenticated users to update billing records
CREATE POLICY "billing_update_policy" ON public.billing
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for authenticated users to delete billing records
CREATE POLICY "billing_delete_policy" ON public.billing
FOR DELETE TO authenticated
USING (true);

-- Grant necessary permissions to authenticated role
GRANT ALL ON public.billing TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_billing_record TO authenticated;
