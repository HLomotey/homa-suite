/**
 * Base types for Supabase integration
 * These types define the core structure for database tables
 */

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Import this type from the generated database types
import { Database } from './database';

// User status enum
export type UserStatus = 'active' | 'inactive' | 'pending';

// User role enum
export type UserRole = 'admin' | 'manager' | 'staff' | 'guest';

// Base user type that matches the structure in UserDetail.tsx
export interface BaseUser {
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

// Base department type
export interface BaseDepartment {
  id: string;
  name: string;
  description?: string;
}

// Base role type
export interface BaseRole {
  id: string;
  name: string;
  description: string;
  permissions?: string[];
}
