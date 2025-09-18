export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
            foreignKeyName: "complaint_attachments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
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
            foreignKeyName: "complaint_comments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "complaint_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "complaint_routing_rules_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_routing_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_routing_rules_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "complaint_subcategories"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "complaint_slas_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_slas_escalation_user_id_fkey"
            columns: ["escalation_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "complaint_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_staff: {
        Row: {
          id: string
          business_key: string
          "PAYROLL FIRST NAME": string | null
          "PAYROLL LAST NAME": string | null
          "PAYROLL MIDDLE NAME": string | null
          "GENERATION SUFFIX": string | null
          "GENDER (SELF-ID)": string | null
          "BIRTH DATE": string | null
          "PRIMARY ADDRESS LINE 1": string | null
          "PRIMARY ADDRESS LINE 2": string | null
          "PRIMARY ADDRESS LINE 3": string | null
          "LIVED-IN STATE": string | null
          "WORKED IN STATE": string | null
          "PERSONAL E-MAIL": string | null
          "WORK E-MAIL": string | null
          "HOME PHONE": string | null
          "WORK PHONE": string | null
          "POSITION ID": string | null
          "ASSOCIATE ID": string | null
          "FILE NUMBER": string | null
          "COMPANY CODE": string | null
          "JOB TITLE": string | null
          "BUSINESS UNIT": string | null
          "HOME DEPARTMENT": string | null
          "LOCATION": string | null
          "WORKER CATEGORY": string | null
          "POSITION STATUS": string | null
          "HIRE DATE": string | null
          "REHIRE DATE": string | null
          "TERMINATION DATE": string | null
          "YEARS OF SERVICE": string | null
          "REPORTS TO NAME": string | null
          "JOB CLASS": string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          business_key: string
          "PAYROLL FIRST NAME"?: string | null
          "PAYROLL LAST NAME"?: string | null
          "PAYROLL MIDDLE NAME"?: string | null
          "GENERATION SUFFIX"?: string | null
          "GENDER (SELF-ID)"?: string | null
          "BIRTH DATE"?: string | null
          "PRIMARY ADDRESS LINE 1"?: string | null
          "PRIMARY ADDRESS LINE 2"?: string | null
          "PRIMARY ADDRESS LINE 3"?: string | null
          "LIVED-IN STATE"?: string | null
          "WORKED IN STATE"?: string | null
          "PERSONAL E-MAIL"?: string | null
          "WORK E-MAIL"?: string | null
          "HOME PHONE"?: string | null
          "WORK PHONE"?: string | null
          "POSITION ID"?: string | null
          "ASSOCIATE ID"?: string | null
          "FILE NUMBER"?: string | null
          "COMPANY CODE"?: string | null
          "JOB TITLE"?: string | null
          "BUSINESS UNIT"?: string | null
          "HOME DEPARTMENT"?: string | null
          "LOCATION"?: string | null
          "WORKER CATEGORY"?: string | null
          "POSITION STATUS"?: string | null
          "HIRE DATE"?: string | null
          "REHIRE DATE"?: string | null
          "TERMINATION DATE"?: string | null
          "YEARS OF SERVICE"?: string | null
          "REPORTS TO NAME"?: string | null
          "JOB CLASS"?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          business_key?: string
          "PAYROLL FIRST NAME"?: string | null
          "PAYROLL LAST NAME"?: string | null
          "PAYROLL MIDDLE NAME"?: string | null
          "GENERATION SUFFIX"?: string | null
          "GENDER (SELF-ID)"?: string | null
          "BIRTH DATE"?: string | null
          "PRIMARY ADDRESS LINE 1"?: string | null
          "PRIMARY ADDRESS LINE 2"?: string | null
          "PRIMARY ADDRESS LINE 3"?: string | null
          "LIVED-IN STATE"?: string | null
          "WORKED IN STATE"?: string | null
          "PERSONAL E-MAIL"?: string | null
          "WORK E-MAIL"?: string | null
          "HOME PHONE"?: string | null
          "WORK PHONE"?: string | null
          "POSITION ID"?: string | null
          "ASSOCIATE ID"?: string | null
          "FILE NUMBER"?: string | null
          "COMPANY CODE"?: string | null
          "JOB TITLE"?: string | null
          "BUSINESS UNIT"?: string | null
          "HOME DEPARTMENT"?: string | null
          "LOCATION"?: string | null
          "WORKER CATEGORY"?: string | null
          "POSITION STATUS"?: string | null
          "HIRE DATE"?: string | null
          "REHIRE DATE"?: string | null
          "TERMINATION DATE"?: string | null
          "YEARS OF SERVICE"?: string | null
          "REPORTS TO NAME"?: string | null
          "JOB CLASS"?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string
          phone: string | null
          avatar_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          email: string
          phone?: string | null
          avatar_url?: string | null
          status?: string
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string | null
          email?: string
          phone?: string | null
          avatar_url?: string | null
          status?: string
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string | null
          address: string
          city: string
          state: string
          zip_code: string
          property_type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          address: string
          city: string
          state: string
          zip_code: string
          property_type: string
          status?: string
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          address?: string
          city?: string
          state?: string
          zip_code?: string
          property_type?: string
          status?: string
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
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
          display_name: string | null
          description: string | null
          is_system_role: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          display_name?: string | null
          description?: string | null
          is_system_role?: boolean
          is_active?: boolean
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          display_name?: string | null
          description?: string | null
          is_system_role?: boolean
          is_active?: boolean
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: "active" | "inactive" | "suspended"
      property_status: "Available" | "Pending" | "Sold" | "Rented"
      property_type: "Apartment" | "House" | "Condo" | "Townhouse" | "Land" | "Studio" | "Loft"
      room_status: "Available" | "Occupied" | "Maintenance" | "Reserved"
      room_type: "Single" | "Double" | "Suite" | "Studio"
      assignment_status: "Active" | "Pending" | "Expired" | "Terminated"
      payment_status: "Paid" | "Pending" | "Overdue" | "Partial"
      job_order_status: "filled" | "pending"
      bill_status: "paid" | "pending" | "overdue"
      bill_type: "rent" | "utilities" | "transport" | "maintenance"
      vehicle_status: "active" | "maintenance" | "repair" | "retired"
      vehicle_type: "car" | "truck" | "bus" | "van"
      department_status: "Growing" | "Stable" | "Downsizing"
      job_status: "Open" | "Closed" | "Filled"
      hr_job_type: "Full-time" | "Part-time" | "Contract" | "Temporary" | "Internship"
      employee_status: "Active" | "On Leave" | "Terminated"
      transaction_type: "income" | "expense"
      transaction_status: "completed" | "pending" | "cancelled"
      budget_status: "on-track" | "warning" | "critical"
      invoice_status: "paid" | "pending" | "overdue" | "cancelled"
      tenant_status: "Active" | "Pending" | "Former" | "Blacklisted"
      inventory_transaction_type: "received" | "issued" | "adjusted"
      purchase_order_status: "draft" | "ordered" | "partial" | "delivered" | "cancelled"
      complaint_status: "new" | "in_progress" | "waiting_on_user" | "resolved" | "closed"
      complaint_priority: "low" | "medium" | "high" | "urgent"
      complaint_asset_type: "property" | "transport"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
