# Supabase Integration Structure

This document describes the modular architecture for Supabase integration in our application. This structure provides a clean separation of concerns, type safety, and maintainability.

## Directory Structure

```
src/integration/supabase/
├── client.ts                 # Supabase client initialization
├── types.ts                  # Main types aggregation/export file
├── types/
│   ├── database.ts           # Database schema definition
│   ├── profile.ts            # Profile entity types
│   ├── department.ts         # Department entity types
│   └── role.ts               # Role entity types
```

## File Descriptions

### `client.ts`

Initializes and exports the Supabase client with proper typing. Also provides helper functions for authentication.

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/database";

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for auth, etc.
export const getSession = async () => {
  /* ... */
};
export const getCurrentUser = async () => {
  /* ... */
};
export const signOut = async () => {
  /* ... */
};
```

### `types/database.ts`

Defines the overall database schema using entity types imported from other files. Uses TypeScript utility types like `Omit` and `Partial` for Insert and Update operations.

```typescript
export type Json = /* ... */;

// Import entity types from their respective files
import { User, Profile } from './profile';
import { Department } from './department';
import { Role } from './role';

// Database interface using the imported types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      departments: {
        Row: Department;
        Insert: Omit<Department, "id" | "created_at">;
        Update: Partial<Omit<Department, "id" | "created_at">>;
      };
      // ... other tables
    };
    Views: { /* ... */ };
    Functions: { /* ... */ };
    Enums: { /* ... */ };
  };
}
```

### `types/profile.ts`

Defines Profile entity types and related interfaces. Consolidates these related entities into a single file.

```typescript
import { Json } from "./database";

// Database entity interfaces
export interface Profile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  status: string;
  last_active: string | null;
  permissions: string[] | null;
  created_at: string;
  updated_at: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  bio: string | null;
  preferences: Json | null;
  created_at: string;
  updated_at: string | null;
}

// Frontend types
export type UserStatus = "active" | "inactive" | "pending";
export type UserRole = "admin" | "manager" | "staff" | "guest";

export interface FrontendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastActive?: string;
  permissions?: string[];
  createdAt?: string;
  avatar?: string;
}

export interface UserWithProfile extends FrontendUser {
  profile?: {
    bio?: string | null;
    preferences?: Record<string, any> | null;
    avatarUrl?: string | null;
  };
}

// Mapping functions
export const mapDatabaseUserToFrontend = (dbUser: User): FrontendUser => {
  /* ... */
};
export const mapDatabaseProfileToProfile = (
  dbProfile: Profile
): UserWithProfile["profile"] => {
  /* ... */
};
```

### `types/department.ts`

Defines Department entity types and related interfaces.

```typescript
// Database entity interface
export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Frontend type
export interface FrontendDepartment {
  id: string;
  name: string;
  description?: string;
}

// Mapping function
export const mapDatabaseDepartmentToFrontend = (
  dbDepartment: Department
): FrontendDepartment => {
  /* ... */
};
```

### `types/role.ts`

Defines Role entity types and related interfaces.

```typescript
// Database entity interface
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[] | null;
  created_at: string;
}

// Frontend type
export interface FrontendRole {
  id: string;
  name: string;
  description: string;
  permissions?: string[];
}

// Mapping function
export const mapDatabaseRoleToFrontend = (dbRole: Role): FrontendRole => {
  /* ... */
};
```

### `types.ts`

Aggregates and re-exports all types from the various type files for easy access.

```typescript
// Re-export database types
export type { Database, Json } from "./types/database";

// Re-export user and profile types
export type {
  User,
  Profile,
  UserStatus,
  UserRole,
  FrontendUser,
  UserWithProfile,
  UserPreferences,
  UserActivity,
} from "./types/user-profile";

// Re-export department types
export type { Department, FrontendDepartment } from "./types/department";

// Re-export role types
export type { Role, FrontendRole } from "./types/role";

// Re-export helper functions
export {
  mapDatabaseUserToFrontend,
  mapDatabaseProfileToProfile,
} from "./types/user-profile";

export { mapDatabaseDepartmentToFrontend } from "./types/department";
export { mapDatabaseRoleToFrontend } from "./types/role";
```

## Design Principles

1. **Modularity**: Each entity has its own file for better organization.
2. **Type Safety**: Strong typing throughout the application.
3. **Separation of Database and Frontend Types**: Clear distinction between database schema and frontend data structures.
4. **Mapping Functions**: Helper functions to convert between database and frontend formats.
5. **Single Source of Truth**: Types are defined once and re-exported where needed.

## Usage Example

```typescript
import { supabase } from "@/integration/supabase/client";
import {
  FrontendUser,
  mapDatabaseUserToFrontend,
} from "@/integration/supabase/types";

async function getUserById(id: string): Promise<FrontendUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching user:", error);
    return null;
  }

  return mapDatabaseUserToFrontend(data);
}
```

## Benefits of This Structure

1. **Maintainability**: Changes to database schema only need to be updated in one place.
2. **Code Organization**: Clear separation of concerns with modular files.
3. **Type Safety**: TypeScript provides compile-time checking of database operations.
4. **Developer Experience**: Autocomplete and type hints for database operations.
5. **Consistency**: Standardized mapping between database and frontend formats.
