# Manual Cleanup Guide for Orphaned Auth Users

## Problem
You have a user in Supabase Auth (`auth.users`) but no corresponding profile in your `profiles` table, preventing you from creating or deleting the user through your app.

## Solution Options

### Option 1: Delete via Supabase Dashboard (Easiest)
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Find the user by email address
4. Click the **Delete** button next to the user
5. Confirm deletion
6. You can now recreate the user with the same email

### Option 2: Create Missing Profile via SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query (replace the values):

```sql
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    status,
    created_at,
    updated_at
) VALUES (
    'PASTE_USER_ID_FROM_AUTH_DASHBOARD',  -- Get this from Auth > Users
    'problematic@email.com',              -- Replace with actual email
    'User Name',                          -- Replace with actual name
    'pending',
    NOW(),
    NOW()
);
```

### Option 3: Use the JavaScript Cleanup Script
1. Update the values in `cleanup-orphaned-user.js`:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (from Settings > API)
   - `PROBLEMATIC_EMAIL`: The email causing issues
2. Run: `node cleanup-orphaned-user.js`

## Prevention
The updated user creation flow now includes automatic rollback, so this shouldn't happen again with new users.

## Quick Steps for Your Current Issue
1. Go to Supabase Dashboard > Authentication > Users
2. Find your problematic email
3. Delete the user
4. Try creating the user again through your app
