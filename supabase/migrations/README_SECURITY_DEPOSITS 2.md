# Security Deposits Migration Guide

This directory contains the complete set of migrations for the Security Deposit System implementation.

## Migration Files (Execute in Order)

### 1. `20250914_001_create_security_deposits_tables.sql`
- Creates `security_deposits` and `security_deposit_deductions` tables
- Sets up foreign key constraints and indexes
- Enables Row Level Security (RLS) with policies
- Adds table and column comments

### 2. `20250914_002_create_deduction_schedule_function.sql`
- Creates `create_deduction_schedule()` function
- Automatically generates 4 payroll deductions based on employment start date
- Schedules deductions on 7th and 22nd of each month
- Handles date calculations and edge cases

### 3. `20250914_003_create_security_deposit_triggers.sql`
- Creates `create_security_deposit_for_assignment()` function
- Sets up triggers for automatic deposit creation on assignment insert/update
- Triggers when assignment becomes active with tenant assigned
- Includes comprehensive error handling and logging

### 4. `20250914_004_create_updated_at_triggers.sql`
- Creates `update_updated_at_column()` function
- Sets up triggers to automatically update `updated_at` timestamps
- Applied to both security deposit tables

### 5. `20250914_005_backfill_existing_assignments.sql`
- Backfills security deposits for existing active assignments
- Only creates deposits for assignments with tenants that don't already have deposits
- Logs the number of deposits created

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content **in order**
4. Execute each migration one by one

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI configured
supabase db reset  # Optional: reset to clean state
supabase db push   # Push all migrations
```

## Database Schema Overview

### `security_deposits` Table
- **Purpose**: Stores security deposit records for property assignments
- **Amount**: Fixed $500 per assignment
- **Payment Method**: Always `payroll_deduction`
- **Status**: `pending`, `partial`, `paid`, `refunded`

### `security_deposit_deductions` Table
- **Purpose**: Tracks the 4 payroll deductions for each security deposit
- **Amount**: Typically $125 each (final payment adjusts for remainder)
- **Schedule**: Based on employment start date and payroll dates (7th/22nd)
- **Status**: `scheduled`, `deducted`, `waived`, `adjusted`

## Automatic Behavior

### When Assignment is Created/Updated
- If assignment has `tenant_id` AND `status = 'Active'`
- Security deposit is automatically created ($500)
- Deduction schedule is automatically generated (4 payments)

### Deduction Schedule Logic
- Based on employee's employment start date from `external_staff` table
- Deductions occur on company payroll dates: 7th and 22nd of each month
- First deduction date calculated based on start date:
  - Start ≤ 7th: First deduction on 7th of same month
  - Start 8th-22nd: First deduction on 22nd of same month  
  - Start > 22nd: First deduction on 7th of next month

## Verification Queries

After applying migrations, verify the setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'security_deposit%';

-- Check triggers exist
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%security_deposit%';

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%security_deposit%';

-- Test deposit creation
SELECT sd.*, sdd.deduction_number, sdd.scheduled_date, sdd.amount
FROM security_deposits sd
LEFT JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
ORDER BY sd.created_at DESC, sdd.deduction_number;
```

## Troubleshooting

### Common Issues
1. **Foreign key constraint errors**: Ensure `assignments` table exists and has proper structure
2. **RLS policy errors**: Verify user authentication and permissions
3. **Date calculation errors**: Check `external_staff` table has valid employment start dates
4. **Trigger not firing**: Verify assignment has both `tenant_id` and `status = 'Active'`

### Debug Queries
```sql
-- Check assignment status
SELECT id, tenant_id, status, created_at 
FROM assignments 
WHERE tenant_id IS NOT NULL;

-- Check for deposits without deductions
SELECT sd.id, sd.assignment_id, COUNT(sdd.id) as deduction_count
FROM security_deposits sd
LEFT JOIN security_deposit_deductions sdd ON sd.id = sdd.security_deposit_id
GROUP BY sd.id, sd.assignment_id
HAVING COUNT(sdd.id) = 0;

-- View trigger logs (if NOTICE level logging is enabled)
-- Check PostgreSQL logs for RAISE NOTICE messages
```
