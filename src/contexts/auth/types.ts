/**
 * Authentication Types and Interfaces
 * Centralized type definitions for the authentication system
 */

import { User, Session } from "@supabase/supabase-js";
import { Json } from "@/integration/supabase/types/database";

/**
 * External Staff Member interface
 */
export interface ExternalStaffMember {
  id: string;
  email: string;
  full_name: string;
  position_status: string;
  is_active: boolean;
}

/**
 * Profile interface for management users
 */
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Role interface
 */
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system_role: boolean;
  is_active: boolean;
}

/**
 * Permission interface
 */
export interface Permission {
  id: string;
  permission_key: string;
  display_name: string;
  description: string;
}

/**
 * Main AuthUser interface combining all user data
 */
export interface AuthUser {
  // Supabase auth user
  user: User;
  session: Session;

  // Staff information
  externalStaff: ExternalStaffMember | null;

  // Management information (if applicable)
  profile: Profile | null;
  role: Role | null;
  permissions: Permission[];
  modules: string[];

  // User type
  userType: "general_staff" | "management" | null;
}

/**
 * User validation result
 */
export interface UserValidationResult {
  isValid: boolean;
  userType: 'external_staff' | 'management' | 'auth_only';
  details: string;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasPermission: (permissionKey: string) => boolean;
  hasModule: (moduleId: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isManagement: () => boolean;
  isGeneralStaff: () => boolean;
}

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication constants
 */
export const AUTH_CONSTANTS = {
  INACTIVITY_TIMEOUT: 5 * 60 * 1000, // 5 minutes in milliseconds
  GENERAL_STAFF_MODULES: ["properties", "complaints", "profile"],
} as const;
