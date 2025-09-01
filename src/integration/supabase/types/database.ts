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
  BillingStats,
  Payroll
} from './billing';
import { ExternalStaff, UpdateExternalStaff, HistoryExternalStaff } from './external-staff';
import {
  Attendance
} from './attendance';
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
  RevenueProfitData,
  Invoice
} from './finance';
import {
  Tenant
} from './tenant';
import {
  InventoryItem,
  InventoryStock,
  InventoryTransaction,
  InventorySupplier,
  InventoryPurchaseOrder,
  InventoryPurchaseOrderItem
} from './inventory';
import {
  Complaint,
  ComplaintCategory,
  ComplaintSubcategory,
  ComplaintComment,
  ComplaintAttachment,
  ComplaintRoutingRule,
  ComplaintSLA,
  ComplaintHistory
} from './complaints';

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
      external_staff: {
        Row: {
          id: string;
          business_key: string;
          "PAYROLL FIRST NAME": string | null;
          "PAYROLL LAST NAME": string | null;
          "PAYROLL MIDDLE NAME": string | null;
          "GENERATION SUFFIX": string | null;
          "GENDER (SELF-ID)": string | null;
          "BIRTH DATE": string | null;
          "PRIMARY ADDRESS LINE 1": string | null;
          "PRIMARY ADDRESS LINE 2": string | null;
          "PRIMARY ADDRESS LINE 3": string | null;
          "LIVED-IN STATE": string | null;
          "WORKED IN STATE": string | null;
          "PERSONAL E-MAIL": string | null;
          "WORK E-MAIL": string | null;
          "HOME PHONE": string | null;
          "WORK PHONE": string | null;
          "POSITION ID": string | null;
          "ASSOCIATE ID": string | null;
          "FILE NUMBER": string | null;
          "COMPANY CODE": string | null;
          "JOB TITLE": string | null;
          "BUSINESS UNIT": string | null;
          "HOME DEPARTMENT": string | null;
          "LOCATION": string | null;
          "WORKER CATEGORY": string | null;
          "POSITION STATUS": string | null;
          "HIRE DATE": string | null;
          "REHIRE DATE": string | null;
          "TERMINATION DATE": string | null;
          "YEARS OF SERVICE": string | null;
          "REPORTS TO NAME": string | null;
          "JOB CLASS": string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["external_staff"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Database["public"]["Tables"]["external_staff"]["Row"], "id" | "created_at">>;
      };
      history_external_staff: {
        Row: {
          id: string;
          business_key: string;
          "PAYROLL FIRST NAME": string | null;
          "PAYROLL LAST NAME": string | null;
          "PAYROLL MIDDLE NAME": string | null;
          "GENERATION SUFFIX": string | null;
          "GENDER (SELF-ID)": string | null;
          "BIRTH DATE": string | null;
          "PRIMARY ADDRESS LINE 1": string | null;
          "PRIMARY ADDRESS LINE 2": string | null;
          "PRIMARY ADDRESS LINE 3": string | null;
          "LIVED-IN STATE": string | null;
          "WORKED IN STATE": string | null;
          "PERSONAL E-MAIL": string | null;
          "WORK E-MAIL": string | null;
          "HOME PHONE": string | null;
          "WORK PHONE": string | null;
          "POSITION ID": string | null;
          "ASSOCIATE ID": string | null;
          "FILE NUMBER": string | null;
          "COMPANY CODE": string | null;
          "JOB TITLE": string | null;
          "BUSINESS UNIT": string | null;
          "HOME DEPARTMENT": string | null;
          "LOCATION": string | null;
          "WORKER CATEGORY": string | null;
          "POSITION STATUS": string | null;
          "HIRE DATE": string | null;
          "REHIRE DATE": string | null;
          "TERMINATION DATE": string | null;
          "YEARS OF SERVICE": string | null;
          "REPORTS TO NAME": string | null;
          "JOB CLASS": string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["history_external_staff"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Database["public"]["Tables"]["history_external_staff"]["Row"], "id" | "created_at">>;
      };
      billing_stats: {
        Row: BillingStats;
        Insert: Omit<BillingStats, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<BillingStats, "id" | "created_at">>;
      };
      payroll: {
        Row: Payroll;
        Insert: Omit<Payroll, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Payroll, "id" | "created_at">>;
      };
      attendance: {
        Row: Attendance;
        Insert: Omit<Attendance, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Attendance, "id" | "created_at">>;
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
      finance_invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, "created_at" | "updated_at">;
        Update: Partial<Omit<Invoice, "created_at">>;
      };
      tenants: {
        Row: Tenant;
        Insert: Omit<Tenant, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Tenant, "id" | "created_at">>;
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<InventoryItem, "id" | "created_at">>;
      };
      inventory_stock: {
        Row: InventoryStock;
        Insert: Omit<InventoryStock, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<InventoryStock, "id" | "created_at">>;
      };
      inventory_transactions: {
        Row: InventoryTransaction;
        Insert: Omit<InventoryTransaction, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<InventoryTransaction, "id" | "created_at">>;
      };
      inventory_suppliers: {
        Row: InventorySupplier;
        Insert: Omit<InventorySupplier, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<InventorySupplier, "id" | "created_at">>;
      };
      inventory_purchase_orders: {
        Row: InventoryPurchaseOrder;
        Insert: Omit<InventoryPurchaseOrder, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<InventoryPurchaseOrder, "id" | "created_at">>;
      };
      inventory_purchase_order_items: {
        Row: InventoryPurchaseOrderItem;
        Insert: Omit<InventoryPurchaseOrderItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<InventoryPurchaseOrderItem, "id" | "created_at">>;
      };
      complaints: {
        Row: Complaint;
        Insert: Omit<Complaint, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Complaint, "id" | "created_at">>;
      };
      complaint_categories: {
        Row: ComplaintCategory;
        Insert: Omit<ComplaintCategory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ComplaintCategory, "id" | "created_at">>;
      };
      complaint_subcategories: {
        Row: ComplaintSubcategory;
        Insert: Omit<ComplaintSubcategory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ComplaintSubcategory, "id" | "created_at">>;
      };
      complaint_comments: {
        Row: ComplaintComment;
        Insert: Omit<ComplaintComment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ComplaintComment, "id" | "created_at">>;
      };
      complaint_attachments: {
        Row: ComplaintAttachment;
        Insert: Omit<ComplaintAttachment, "id" | "created_at">;
        Update: Partial<Omit<ComplaintAttachment, "id" | "created_at">>;
      };
      complaint_routing_rules: {
        Row: ComplaintRoutingRule;
        Insert: Omit<ComplaintRoutingRule, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ComplaintRoutingRule, "id" | "created_at">>;
      };
      complaint_slas: {
        Row: ComplaintSLA;
        Insert: Omit<ComplaintSLA, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ComplaintSLA, "id" | "created_at">>;
      };
      complaint_history: {
        Row: ComplaintHistory;
        Insert: Omit<ComplaintHistory, "id" | "created_at">;
        Update: Partial<Omit<ComplaintHistory, "id" | "created_at">>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          is_primary: boolean;
          assigned_by: string;
          assigned_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role_id: string;
          is_primary: boolean;
          assigned_by: string;
          assigned_at?: string;
        };
        Update: {
          role_id?: string;
          is_primary?: boolean;
          assigned_by?: string;
          assigned_at?: string;
        };
      };
      company_locations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          is_active?: boolean;
        };
      };
      staff_locations: {
        Row: {
          id: string;
          company_location_id: string;
          location_code: string;
          location_description: string;
          is_active: boolean;
          external_staff_id: string | null;
          manager_id: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          company_location_id: string;
          location_code: string;
          location_description: string;
          is_active?: boolean;
          external_staff_id?: string | null;
          manager_id?: string | null;
        };
        Update: {
          company_location_id?: string;
          location_code?: string;
          location_description?: string;
          is_active?: boolean;
          external_staff_id?: string | null;
          manager_id?: string | null;
          updated_at?: string;
        };
      };
      staff_locations_history: {
        Row: {
          id: string;
          staff_location_id: string;
          company_location_id: string;
          location_code: string;
          location_description: string;
          is_active: boolean;
          external_staff_id: string | null;
          manager_id: string | null;
          changed_at: string;
          changed_by: string | null;
          change_type: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values: Json | null;
          new_values: Json | null;
        };
        Insert: {
          staff_location_id: string;
          company_location_id: string;
          location_code: string;
          location_description: string;
          is_active: boolean;
          external_staff_id?: string | null;
          manager_id?: string | null;
          changed_by?: string | null;
          change_type: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: Json | null;
          new_values?: Json | null;
        };
        Update: {
          staff_location_id?: string;
          company_location_id?: string;
          location_code?: string;
          location_description?: string;
          is_active?: boolean;
          external_staff_id?: string | null;
          manager_id?: string | null;
          changed_by?: string | null;
          change_type?: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: Json | null;
          new_values?: Json | null;
        };
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
      invoice_status: "paid" | "pending" | "overdue" | "cancelled";
      tenant_status: "Active" | "Pending" | "Former" | "Blacklisted";
      inventory_transaction_type: "received" | "issued" | "adjusted";
      purchase_order_status: "draft" | "ordered" | "partial" | "delivered" | "cancelled";
      complaint_status: "new" | "in_progress" | "waiting_on_user" | "resolved" | "closed";
      complaint_priority: "low" | "medium" | "high" | "urgent";
      complaint_asset_type: "property" | "transport";
    };
  };
};

