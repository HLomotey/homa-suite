# Billing Migration Instructions

## Overview
This migration adds the missing database columns and tables required for the billing functionality to work properly.

## What This Migration Adds

### New Columns to `assignments` table:
- `transportation_agreement` (BOOLEAN) - Whether staff has transportation benefits
- `transport_amount` (DECIMAL) - Monthly transportation allowance
- `bus_card_agreement` (BOOLEAN) - Whether staff has bus card benefits  
- `bus_card_amount` (DECIMAL) - Bus card amount
- `housing_agreement` (BOOLEAN) - Whether staff has housing benefits (defaults to TRUE)
- `rent_deposit_amount` (DECIMAL) - Security deposit amount

### New Tables:
- `billing_deductions` - Stores scheduled deductions for security deposits, bus cards, etc.
- `flight_agreement_deductions` - Stores scheduled deductions for flight agreements
- `flight_agreements` - Stores flight agreements with staff members

### Additional Features:
- Proper indexes for performance
- RLS (Row Level Security) policies
- Triggers for automatic timestamp updates
- Comments for documentation

## How to Run the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/add_billing_columns_and_tables.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Command Line (if you have psql access)
```bash
psql -h your-supabase-host -U postgres -d postgres -f migrations/add_billing_columns_and_tables.sql
```

### Option 3: Supabase CLI (if you have it set up)
```bash
supabase db push
```

## Verification

After running the migration, you can verify it worked by checking:

1. **New columns exist in assignments table:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assignments' 
AND column_name IN ('transportation_agreement', 'transport_amount', 'bus_card_agreement', 'bus_card_amount', 'housing_agreement', 'rent_deposit_amount');
```

2. **New tables exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('billing_deductions', 'flight_agreement_deductions', 'flight_agreements');
```

3. **Check that the billing generators load without errors** in the application

## Expected Results

After running this migration:
- ✅ The 400 errors in the console should be resolved
- ✅ The billing generators should load assignment data properly
- ✅ You can set transportation and bus card agreements on assignments
- ✅ Security deposit and flight agreement deductions will work
- ✅ The AssignmentsList will show the new amount columns properly

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove new columns from assignments
ALTER TABLE assignments 
DROP COLUMN IF EXISTS transportation_agreement,
DROP COLUMN IF EXISTS transport_amount,
DROP COLUMN IF EXISTS bus_card_agreement,
DROP COLUMN IF EXISTS bus_card_amount,
DROP COLUMN IF EXISTS housing_agreement,
DROP COLUMN IF EXISTS rent_deposit_amount;

-- Drop new tables
DROP TABLE IF EXISTS billing_deductions CASCADE;
DROP TABLE IF EXISTS flight_agreement_deductions CASCADE;
DROP TABLE IF EXISTS flight_agreements CASCADE;
```

## Notes

- This migration is designed to be safe and non-destructive
- It uses `IF NOT EXISTS` and `IF EXISTS` clauses to prevent errors if run multiple times
- Existing data in the assignments table will not be affected
- The `housing_agreement` column will be set to `true` for existing assignments with rent amounts
