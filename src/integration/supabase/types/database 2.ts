// ---------- JSON helper ----------
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ---------- Imports (kwame) ----------
import { User, Profile } from './user-profile'
import { Department } from './department'
import { Role } from './role'
import { Property } from './property'
import { Room } from './room'
import { Assignment } from './assignment'
import {
  JobOrder as OperationsJobOrder,
  RegionPerformance,
  TopPerformer,
  ClientSatisfaction,
  JobOrderTrend,
  TimeToFillTrend,
  JobType as OperationsJobType,
} from './operations'
import {
  JobOrder,
  JobOrderPosition,
  JobOrderPlacement,
  JobOrderAuditLog,
  JobOrderNotification,
} from '@/types/job-order'
import { Bill, BillingStaff, BillingStats, Payroll } from './billing'
import { ExternalStaff, UpdateExternalStaff, HistoryExternalStaff } from './external-staff'
import { Attendance } from './attendance'
import { Vehicle, TransportStaff, TransportStats } from './transport'
import { HRDepartment, JobListing, Employee, DiversityMetrics } from './hr'
import {
  Transaction,
  Budget,
  RevenueMetric,
  ExpenseCategory,
  ClientRevenue,
  FinancialMetric,
  CashFlow,
  RevenueProfitData,
  Invoice,
} from './finance'
import { Tenant } from './tenant'
import {
  InventoryItem,
  InventoryStock,
  InventoryTransaction,
  InventorySupplier,
  InventoryPurchaseOrder,
  InventoryPurchaseOrderItem,
} from './inventory'
import {
  Complaint,
  ComplaintCategory,
  ComplaintSubcategory,
  ComplaintComment,
  ComplaintAttachment,
  ComplaintRoutingRule,
  ComplaintSLA,
  ComplaintHistory,
} from './complaints'

// ---------- Database Types ----------
export type Database = {
  public: {
    Tables: {
      // ---- Core (kwame) ----
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      departments: {
        Row: Department
        Insert: Omit<Department, 'id' | 'created_at'>
        Update: Partial<Omit<Department, 'id' | 'created_at'>>
      }
      roles: {
        Row: Role
        Insert: Omit<Role, 'id' | 'created_at'>
        Update: Partial<Omit<Role, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id' | 'created_at'>>
      }
      rooms: {
        Row: Room
        Insert: Omit<Room, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Room, 'id' | 'created_at'>>
      }
      assignments: {
        Row: Assignment
        Insert: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Assignment, 'id' | 'created_at'>>
      }

      // ---- Job Orders (kwame) ----
      job_orders: {
        Row: JobOrder
        Insert: Omit<JobOrder, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<JobOrder, 'id' | 'created_at'>>
      }
      job_order_positions: {
        Row: JobOrderPosition
        Insert: Omit<JobOrderPosition, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<JobOrderPosition, 'id' | 'created_at'>>
      }
      job_order_placements: {
        Row: JobOrderPlacement
        Insert: Omit<JobOrderPlacement, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<JobOrderPlacement, 'id' | 'created_at'>>
      }
      job_order_audit_logs: {
        Row: JobOrderAuditLog
        Insert: Omit<JobOrderAuditLog, 'id'>
        Update: Partial<Omit<JobOrderAuditLog, 'id'>>
      }
      job_order_notifications: {
        Row: JobOrderNotification
        Insert: Omit<JobOrderNotification, 'id' | 'created_at'>
        Update: Partial<Omit<JobOrderNotification, 'id' | 'created_at'>>
      }

      // ---- Operations analytics (kwame) ----
      operations_job_orders: {
        Row: OperationsJobOrder
        Insert: Omit<OperationsJobOrder, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OperationsJobOrder, 'id' | 'created_at'>>
      }
      region_performance: {
        Row: RegionPerformance
        Insert: Omit<RegionPerformance, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RegionPerformance, 'id' | 'created_at'>>
      }
      top_performers: {
        Row: TopPerformer
        Insert: Omit<TopPerformer, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TopPerformer, 'id' | 'created_at'>>
      }
      client_satisfaction: {
        Row: ClientSatisfaction
        Insert: Omit<ClientSatisfaction, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ClientSatisfaction, 'id' | 'created_at'>>
      }
      job_order_trends: {
        Row: JobOrderTrend
        Insert: Omit<JobOrderTrend, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<JobOrderTrend, 'id' | 'created_at'>>
      }
      time_to_fill_trends: {
        Row: TimeToFillTrend
        Insert: Omit<TimeToFillTrend, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TimeToFillTrend, 'id' | 'created_at'>>
      }
      job_types: {
        Row: OperationsJobType
        Insert: Omit<OperationsJobType, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OperationsJobType, 'id' | 'created_at'>>
      }

      // ---- Billing/Payroll (kwame) ----
      bills: {
        Row: Bill
        Insert: Omit<Bill, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Bill, 'id' | 'created_at'>>
      }
      billing_staff: {
        Row: BillingStaff
        Insert: Omit<BillingStaff, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BillingStaff, 'id' | 'created_at'>>
      }

      // ---- External Staff (consolidated to one definition; kwame) ----
      external_staff: {
        Row: {
          id: string
          business_key: string
          'PAYROLL FIRST NAME': string | null
          'PAYROLL LAST NAME': string | null
          'PAYROLL MIDDLE NAME': string | null
          'GENERATION SUFFIX': string | null
          'GENDER (SELF-ID)': string | null
          'BIRTH DATE': string | null
          'PRIMARY ADDRESS LINE 1': string | null
          'PRIMARY ADDRESS LINE 2': string | null
          'PRIMARY ADDRESS LINE 3': string | null
          'LIVED-IN STATE': string | null
          'WORKED IN STATE': string | null
          'PERSONAL E-MAIL': string | null
          'WORK E-MAIL': string | null
          'HOME PHONE': string | null
          'WORK PHONE': string | null
          'POSITION ID': string | null
          'ASSOCIATE ID': string | null
          'FILE NUMBER': string | null
          'COMPANY CODE': string | null
          'JOB TITLE': string | null
          'BUSINESS UNIT': string | null
          'HOME DEPARTMENT': string | null
          'LOCATION': string | null
          'WORKER CATEGORY': string | null
          'POSITION STATUS': string | null
          'HIRE DATE': string | null
          'REHIRE DATE': string | null
          'TERMINATION DATE': string | null
          'YEARS OF SERVICE': string | null
          'REPORTS TO NAME': string | null
          'JOB CLASS': string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          business_key: string
          'PAYROLL FIRST NAME'?: string | null
          'PAYROLL LAST NAME'?: string | null
          'PAYROLL MIDDLE NAME'?: string | null
          'GENERATION SUFFIX'?: string | null
          'GENDER (SELF-ID)'?: string | null
          'BIRTH DATE'?: string | null
          'PRIMARY ADDRESS LINE 1'?: string | null
          'PRIMARY ADDRESS LINE 2'?: string | null
          'PRIMARY ADDRESS LINE 3'?: string | null
          'LIVED-IN STATE'?: string | null
          'WORKED IN STATE'?: string | null
          'PERSONAL E-MAIL'?: string | null
          'WORK E-MAIL'?: string | null
          'HOME PHONE'?: string | null
          'WORK PHONE'?: string | null
          'POSITION ID'?: string | null
          'ASSOCIATE ID'?: string | null
          'FILE NUMBER'?: string | null
          'COMPANY CODE'?: string | null
          'JOB TITLE'?: string | null
          'BUSINESS UNIT'?: string | null
          'HOME DEPARTMENT'?: string | null
          'LOCATION'?: string | null
          'WORKER CATEGORY'?: string | null
          'POSITION STATUS'?: string | null
          'HIRE DATE'?: string | null
          'REHIRE DATE'?: string | null
          'TERMINATION DATE'?: string | null
          'YEARS OF SERVICE'?: string | null
          'REPORTS TO NAME'?: string | null
          'JOB CLASS'?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          business_key?: string
          'PAYROLL FIRST NAME'?: string | null
          'PAYROLL LAST NAME'?: string | null
          'PAYROLL MIDDLE NAME'?: string | null
          'GENERATION SUFFIX'?: string | null
          'GENDER (SELF-ID)'?: string | null
          'BIRTH DATE'?: string | null
          'PRIMARY ADDRESS LINE 1'?: string | null
          'PRIMARY ADDRESS LINE 2'?: string | null
          'PRIMARY ADDRESS LINE 3'?: string | null
          'LIVED-IN STATE'?: string | null
          'WORKED IN STATE'?: string | null
          'PERSONAL E-MAIL'?: string | null
          'WORK E-MAIL'?: string | null
          'HOME PHONE'?: string | null
          'WORK PHONE'?: string | null
          'POSITION ID'?: string | null
          'ASSOCIATE ID'?: string | null
          'FILE NUMBER'?: string | null
          'COMPANY CODE'?: string | null
          'JOB TITLE'?: string | null
          'BUSINESS UNIT'?: string | null
          'HOME DEPARTMENT'?: string | null
          'LOCATION'?: string | null
          'WORKER CATEGORY'?: string | null
          'POSITION STATUS'?: string | null
          'HIRE DATE'?: string | null
          'REHIRE DATE'?: string | null
          'TERMINATION DATE'?: string | null
          'YEARS OF SERVICE'?: string | null
          'REPORTS TO NAME'?: string | null
          'JOB CLASS'?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ---- Complaints module (from main; matches kwame imports) ----
      complaint_attachments: {
        Row: {
          complaint_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_by: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'complaint_attachments_complaint_id_fkey'
            columns: ['complaint_id']
            isOneToOne: false
            referencedRelation: 'complaints'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaint_attachments_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      complaint_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          asset_type: string | null
          sla_hours: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          asset_type?: string | null
          sla_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          asset_type?: string | null
          sla_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      complaint_comments: {
        Row: {
          comment: string
          complaint_id: string
          created_at: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          complaint_id: string
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          complaint_id?: string
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'complaint_comments_complaint_id_fkey'
            columns: ['complaint_id']
            isOneToOne: false
            referencedRelation: 'complaints'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaint_comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      complaint_history: {
        Row: {
          action: string
          complaint_id: string
          created_at: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          action: string
          complaint_id: string
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          action?: string
          complaint_id?: string
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'complaint_history_complaint_id_fkey'
            columns: ['complaint_id']
            isOneToOne: false
            referencedRelation: 'complaints'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaint_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      complaint_routing_rules: {
        Row: {
          asset_id: string | null
          asset_type: string
          assigned_to: string | null
          category_id: string | null
          created_at: string
          id: string
          priority: number
          subcategory_id: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_type: string
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          priority?: number
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_type?: string
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          priority?: number
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'complaint_routing_rules_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaint_routing_rules_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'complaint_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaint_routing_rules_subcategory_id_fkey'
            columns: ['subcategory_id']
            isOneToOne: false
            referencedRelation: 'complaint_subcategories'
            referencedColumns: ['id']
          }
        ]
      }
      complaint_slas: {
        Row: {
          asset_type: string
          category_id: string | null
          created_at: string
          escalation_user_id: string | null
          hours_to_resolve: number
          id: string
          priority: string
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          category_id?: string | null
          created_at?: string
          escalation_user_id?: string | null
          hours_to_resolve?: number
          id?: string
          priority: string
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          category_id?: string | null
          created_at?: string
          escalation_user_id?: string | null
          hours_to_resolve?: number
          id?: string
          priority?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'complaint_slas_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'complaint_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaint_slas_escalation_user_id_fkey'
            columns: ['escalation_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      complaint_subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          sla_hours: number | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sla_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sla_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'complaint_subcategories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'complaint_categories'
            referencedColumns: ['id']
          }
        ]
      }
      complaints: {
        Row: {
          asset_id: string | null
          asset_type: string
          assigned_to: string | null
          category_id: string
          closed_at: string | null
          contact_method: string | null
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          escalated_to: string | null
          id: string
          location: Json | null
          priority: string
          property_id: string | null
          resolved_at: string | null
          sla_breach: boolean
          status: string
          subcategory_id: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_type: string
          assigned_to?: string | null
          category_id: string
          closed_at?: string | null
          contact_method?: string | null
          created_at?: string
          created_by: string
          description: string
          due_date?: string | null
          escalated_to?: string | null
          id?: string
          location?: Json | null
          priority: string
          property_id?: string | null
          resolved_at?: string | null
          sla_breach?: boolean
          status: string
          subcategory_id?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_type?: string
          assigned_to?: string | null
          category_id?: string
          closed_at?: string | null
          contact_method?: string | null
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          escalated_to?: string | null
          id?: string
          location?: Json | null
          priority?: string
          property_id?: string | null
          resolved_at?: string | null
          sla_breach?: boolean
          status?: string
          subcategory_id?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'complaints_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaints_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'complaint_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaints_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaints_escalated_to_fkey'
            columns: ['escalated_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaints_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaints_subcategory_id_fkey'
            columns: ['subcategory_id']
            isOneToOne: false
            referencedRelation: 'complaint_subcategories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complaints_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          }
        ]
      }

      // ---- Permissions & RBAC (main-compatible) ----
      permissions: {
        Row: {
          id: string
          name: string
          display_name: string | null
          description: string | null
          is_system_permission: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          display_name?: string | null
          description?: string | null
          is_system_permission?: boolean
          is_active?: boolean
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          display_name?: string | null
          description?: string | null
          is_system_permission?: boolean
          is_active?: boolean
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          role_id: string
          permission_id: string
          id?: string
          created_at?: string
        }
        Update: {
          role_id?: string
          permission_id?: string
          id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'role_permissions_permission_id_fkey'
            columns: ['permission_id']
            isOneToOne: false
            referencedRelation: 'permissions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'role_permissions_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          role_id: string
          id?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role_id?: string
          id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }

      // ---- Vehicles (main-compatible) ----
      vehicles: {
        Row: {
          id: string
          make: string
          model: string
          year: number
          license_plate: string
          vin: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          make: string
          model: string
          year: number
          license_plate: string
          vin?: string | null
          status?: string
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          make?: string
          model?: string
          year?: number
          license_plate?: string
          vin?: string | null
          status?: string
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      // keep kwame's view
      job_orders_with_details: {
        Row: {
          id: string
          job_order_number: string
          title: string
          description?: string
          organization_id: string
          organization_name?: string
          organization_location?: string
          site_location?: string
          seats_requested: number
          seats_filled: number
          requested_at: string
          requested_start_date?: string
          due_date?: string
          fill_by_date?: string
          completed_at?: string
          closed_at?: string
          status: string
          priority: string
          requestor_id?: string
          requestor_name?: string
          hr_coordinator_id?: string
          coordinator_name?: string
          approver_id?: string
          approver_name?: string
          owner_id?: string
          owner_name?: string
          notes?: string
          approval_notes?: string
          rejection_reason?: string
          completion_notes?: string
          created_at: string
          updated_at: string
          created_by?: string
          updated_by?: string
          fill_percentage: number
          is_overdue: boolean
        }
        Insert: never
        Update: never
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      // keep kwame's richer enums
      user_status: 'active' | 'inactive' | 'pending'
      user_role: 'admin' | 'manager' | 'staff' | 'guest'
      property_status: 'Available' | 'Pending' | 'Sold' | 'Rented'
      property_type: 'Apartment' | 'House' | 'Condo' | 'Townhouse' | 'Land' | 'Studio' | 'Loft'
      room_status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved'
      room_type: 'Single' | 'Double' | 'Suite' | 'Studio'
      assignment_status: 'Active' | 'Pending' | 'Expired' | 'Terminated'
      payment_status: 'Paid' | 'Pending' | 'Overdue' | 'Partial'
      job_order_status:
        | 'DRAFT'
        | 'SUBMITTED'
        | 'APPROVAL_PENDING'
        | 'APPROVED'
        | 'IN_PROGRESS'
        | 'ON_HOLD'
        | 'COMPLETED'
        | 'CLOSED'
        | 'CANCELLED'
        | 'REJECTED'
      placement_status: 'TENTATIVE' | 'CONFIRMED' | 'STARTED' | 'ENDED'
      priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      bill_status: 'paid' | 'pending' | 'overdue'
      bill_type: 'rent' | 'utilities' | 'transport' | 'maintenance'
      vehicle_status: 'active' | 'maintenance' | 'repair' | 'retired'
      vehicle_type: 'car' | 'truck' | 'bus' | 'van'
      department_status: 'Growing' | 'Stable' | 'Downsizing'
      job_status: 'Open' | 'Closed' | 'Filled'
      hr_job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship'
      employee_status: 'Active' | 'On Leave' | 'Terminated'
      transaction_type: 'income' | 'expense'
      transaction_status: 'completed' | 'pending' | 'cancelled'
      budget_status: 'on-track' | 'warning' | 'critical'
      invoice_status: 'paid' | 'pending' | 'overdue' | 'cancelled'
      tenant_status: 'Active' | 'Pending' | 'Former' | 'Blacklisted'
      inventory_transaction_type: 'received' | 'issued' | 'adjusted'
      purchase_order_status: 'draft' | 'ordered' | 'partial' | 'delivered' | 'cancelled'
      complaint_status: 'new' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed'
      complaint_priority: 'low' | 'medium' | 'high' | 'urgent'
      complaint_asset_type: 'property' | 'transport'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

// ---------- Helper mapped types (unchanged) ----------
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends { Insert: infer I }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends { Update: infer U }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
