/**
 * Database schema types for Supabase
 * This file defines the structure of our Supabase database tables
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Import entity types from their respective files
import { User, Profile } from './user-profile';
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
      roles: {
        Row: Role;
        Insert: Omit<Role, "id" | "created_at">;
        Update: Partial<Omit<Role, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_status: "active" | "inactive" | "pending";
      user_role: "admin" | "manager" | "staff" | "guest";
    };
  };
};

