# Transport Module Database Migration

This document provides information about the Transport Module database migration and seed data.

## Overview

The Transport Module consists of several interconnected tables that manage vehicles, maintenance, routes, and assignments. All tables are secured with Row Level Security (RLS) to ensure proper data isolation between organizations.

## Tables

The migration creates the following tables:

1. **vehicles** - Stores information about vehicles in the transport fleet
2. **maintenance_types** - Defines types of maintenance that can be performed on vehicles
3. **maintenance_transactions** - Records of maintenance performed or scheduled for vehicles
4. **routes** - Individual transport routes that can be combined into larger routes
5. **route_schedules** - Schedule information for individual routes (days and times)
6. **combined_routes** - Combinations of individual routes created by managers
7. **combined_route_details** - Details of which routes are included in combined routes and their order
8. **route_assignments** - Assignments of combined routes to vehicles and drivers
9. **route_execution_logs** - Logs of route executions by drivers, including status updates

## Security

All tables have Row Level Security (RLS) enabled with the following policies:

- Organization isolation: Users can only access data from organizations they belong to
- Role-based access: Some tables have additional policies for specific roles (e.g., drivers can only see their own assignments)

## Stored Procedures

The migration includes several helper functions:

- `get_routes_with_schedules(org_id)` - Returns routes with their schedules
- `get_combined_routes_with_details(org_id)` - Returns combined routes with their component routes
- `get_route_assignments_with_details(org_id)` - Returns route assignments with related information
- `get_driver_assignments(driver_uuid)` - Returns assignments for a specific driver

## Applying the Migration

To apply this migration to your Supabase project:

1. Ensure you have the Supabase CLI installed
2. Run the migration:

```bash
supabase db push
```

## Seed Data

The seed data provides sample records for all tables to demonstrate the functionality of the transport module. It includes:

- 3 vehicles
- 3 maintenance types
- 4 maintenance transactions
- 3 routes with various schedules
- 2 combined routes
- 2 route assignments
- 7 route execution logs

To apply the seed data:

```bash
supabase db reset
```

Note: This will reset your database and apply all migrations and seed data.

## Relationships

The database schema maintains the following relationships:

- Vehicles can have multiple maintenance transactions
- Maintenance types can be referenced by multiple transactions
- Routes can have multiple schedules
- Combined routes contain multiple individual routes
- Route assignments link combined routes to vehicles and drivers
- Route execution logs are linked to route assignments

## Testing

After applying the migration and seed data, you can test the functionality by:

1. Querying the tables to verify the data
2. Testing the RLS policies by switching between different users
3. Using the stored procedures to retrieve related data

## Integration with Frontend

The frontend components in the Transport Module are designed to work with this database schema. The API functions in the hooks directory map the database structure to frontend-friendly formats.

## Troubleshooting

If you encounter issues with the migration:

1. Check the Supabase logs for error messages
2. Verify that the organizations table exists and has at least one record
3. Ensure that the auth.users table is properly set up
4. Check that the RLS policies are correctly applied

For any questions or issues, please contact the development team.
