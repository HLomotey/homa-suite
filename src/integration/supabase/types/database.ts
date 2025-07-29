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
  JobType as OperationsJobType 
} from './operations';
import {
  Bill,
  BillingStaff,
  BillingStats
} from './billing';
import {
  Vehicle,
  TransportStaff,
  TransportStats
} from './transport';
import {
  HRDepartment,
  JobListing,
  Employee,
  DiversityMetrics
} from './hr';
import {
  Transaction,
  Budget,
  RevenueMetric,
  ExpenseCategory,
  ClientRevenue,
  FinancialMetric,
  CashFlow,
  RevenueProfitData
} from './finance';
import {
  Tenant
} from './tenant';

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
        Row: OperationsJobType;
        Insert: Omit<OperationsJobType, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<OperationsJobType, "id" | "created_at">>;
      };
      bills: {
        Row: Bill;
        Insert: Omit<Bill, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Bill, "id" | "created_at">>;
      };
      billing_staff: {
        Row: BillingStaff;
        Insert: Omit<BillingStaff, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<BillingStaff, "id" | "created_at">>;
      };
      billing_stats: {
        Row: BillingStats;
        Insert: Omit<BillingStats, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<BillingStats, "id" | "created_at">>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Vehicle, "id" | "created_at">>;
      };
      transport_staff: {
        Row: TransportStaff;
        Insert: Omit<TransportStaff, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TransportStaff, "id" | "created_at">>;
      };
      transport_stats: {
        Row: TransportStats;
        Insert: Omit<TransportStats, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TransportStats, "id" | "created_at">>;
      };
      hr_departments: {
        Row: HRDepartment;
        Insert: Omit<HRDepartment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<HRDepartment, "id" | "created_at">>;
      };
      hr_job_listings: {
        Row: JobListing;
        Insert: Omit<JobListing, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<JobListing, "id" | "created_at">>;
      };
      hr_employees: {
        Row: Employee;
        Insert: Omit<Employee, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Employee, "id" | "created_at">>;
      };
      hr_diversity_metrics: {
        Row: DiversityMetrics;
        Insert: Omit<DiversityMetrics, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DiversityMetrics, "id" | "created_at">>;
      };
      finance_transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "created_at" | "updated_at">;
        Update: Partial<Omit<Transaction, "created_at">>;
      };
      finance_budgets: {
        Row: Budget;
        Insert: Omit<Budget, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Budget, "id" | "created_at">>;
      };
      finance_revenue_metrics: {
        Row: RevenueMetric;
        Insert: Omit<RevenueMetric, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<RevenueMetric, "id" | "created_at">>;
      };
      finance_expense_categories: {
        Row: ExpenseCategory;
        Insert: Omit<ExpenseCategory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ExpenseCategory, "id" | "created_at">>;
      };
      finance_client_revenue: {
        Row: ClientRevenue;
        Insert: Omit<ClientRevenue, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ClientRevenue, "id" | "created_at">>;
      };
      finance_metrics: {
        Row: FinancialMetric;
        Insert: Omit<FinancialMetric, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<FinancialMetric, "id" | "created_at">>;
      };
      finance_cash_flow: {
        Row: CashFlow;
        Insert: Omit<CashFlow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CashFlow, "id" | "created_at">>;
      };
      finance_revenue_profit: {
        Row: RevenueProfitData;
        Insert: Omit<RevenueProfitData, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<RevenueProfitData, "id" | "created_at">>;
      };
      tenants: {
        Row: Tenant;
        Insert: Omit<Tenant, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Tenant, "id" | "created_at">>;
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
      bill_status: "paid" | "pending" | "overdue";
      bill_type: "rent" | "utilities" | "transport" | "maintenance";
      vehicle_status: "active" | "maintenance" | "repair" | "retired";
      vehicle_type: "car" | "truck" | "bus" | "van";
      department_status: "Growing" | "Stable" | "Downsizing";
      job_status: "Open" | "Closed" | "Filled";
      hr_job_type: "Full-time" | "Part-time" | "Contract" | "Temporary" | "Internship";
      employee_status: "Active" | "On Leave" | "Terminated";
      transaction_type: "income" | "expense";
      transaction_status: "completed" | "pending" | "cancelled";
      budget_status: "on-track" | "warning" | "critical";
      tenant_status: "Active" | "Pending" | "Former" | "Blacklisted";
    };
  };
};

