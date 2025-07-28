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
import { Property } from './property';
import { Room } from './room';
import { Assignment } from './assignment';
import { 
  JobOrder, 
  RegionPerformance, 
  TopPerformer, 
  ClientSatisfaction, 
  JobOrderTrend, 
  TimeToFillTrend, 
  JobType 
} from './operations';

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
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Property, "id" | "created_at">>;
      };
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Room, "id" | "created_at">>;
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Assignment, "id" | "created_at">>;
      };
      job_orders: {
        Row: JobOrder;
        Insert: Omit<JobOrder, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<JobOrder, "id" | "created_at">>;
      };
      region_performance: {
        Row: RegionPerformance;
        Insert: Omit<RegionPerformance, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<RegionPerformance, "id" | "created_at">>;
      };
      top_performers: {
        Row: TopPerformer;
        Insert: Omit<TopPerformer, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TopPerformer, "id" | "created_at">>;
      };
      client_satisfaction: {
        Row: ClientSatisfaction;
        Insert: Omit<ClientSatisfaction, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ClientSatisfaction, "id" | "created_at">>;
      };
      job_order_trends: {
        Row: JobOrderTrend;
        Insert: Omit<JobOrderTrend, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<JobOrderTrend, "id" | "created_at">>;
      };
      time_to_fill_trends: {
        Row: TimeToFillTrend;
        Insert: Omit<TimeToFillTrend, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TimeToFillTrend, "id" | "created_at">>;
      };
      job_types: {
        Row: JobType;
        Insert: Omit<JobType, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<JobType, "id" | "created_at">>;
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
      property_status: "Available" | "Pending" | "Sold" | "Rented";
      property_type: "Apartment" | "House" | "Condo" | "Townhouse" | "Land" | "Studio" | "Loft";
      room_status: "Available" | "Occupied" | "Maintenance" | "Reserved";
      room_type: "Single" | "Double" | "Suite" | "Studio";
      assignment_status: "Active" | "Pending" | "Expired" | "Terminated";
      payment_status: "Paid" | "Pending" | "Overdue" | "Partial";
      job_order_status: "filled" | "pending";
    };
  };
};

