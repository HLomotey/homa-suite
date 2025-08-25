/**
 * Types for the complaints management module
 */

import { Json } from "./database";

// Complaint status enum
export type ComplaintStatus = 
  | "new" 
  | "in_progress" 
  | "waiting_on_user" 
  | "resolved" 
  | "closed";

// Complaint priority enum
export type ComplaintPriority = 
  | "low" 
  | "medium" 
  | "high" 
  | "urgent";

// Asset type enum
export type ComplaintAssetType = 
  | "property" 
  | "hotel"
  | "vehicle";

// Base complaint type
export interface Complaint {
  id: string;
  title: string;
  description: string;
  asset_type: ComplaintAssetType;
  asset_id: string; // Reference to property_id or vehicle_id
  category_id: string;
  subcategory_id: string | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  created_by: string; // User ID of the complainant
  assigned_to: string | null; // User ID of the assigned manager
  escalated_to: string | null; // User ID of the escalation owner
  due_date: string | null; // ISO date string for SLA deadline
  location: Json | null; // Geolocation data
  contact_method: string | null; // Preferred contact method
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  sla_breach: boolean; // Flag for SLA breach
}

// Complaint category
export interface ComplaintCategory {
  id: string;
  name: string;
  asset_type: ComplaintAssetType;
  sla_hours: number; // Default SLA hours for this category
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Complaint subcategory
export interface ComplaintSubcategory {
  id: string;
  category_id: string;
  name: string;
  sla_hours: number | null; // Override SLA hours for this subcategory
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Complaint comment/thread
export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string;
  content: string;
  is_internal: boolean; // Internal notes vs public comments
  attachments: Json | null; // Array of attachment URLs
  created_at: string;
  updated_at: string;
}

// Complaint attachment
export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  is_internal: boolean; // Internal vs public attachment
  created_at: string;
}

// Complaint routing rule
export interface ComplaintRoutingRule {
  id: string;
  asset_type: ComplaintAssetType;
  category_id: string | null;
  subcategory_id: string | null;
  asset_id: string | null; // Specific property or vehicle
  location_id: string | null; // Region/location
  assigned_to: string; // User ID to route to
  priority: number; // Rule priority (lower number = higher priority)
  created_at: string;
  updated_at: string;
}

// Complaint SLA configuration
export interface ComplaintSLA {
  id: string;
  priority: ComplaintPriority;
  asset_type: ComplaintAssetType;
  category_id: string | null;
  subcategory_id: string | null;
  hours_to_acknowledge: number;
  hours_to_resolve: number;
  escalation_user_id: string | null;
  created_at: string;
  updated_at: string;
}

// Complaint history/audit log
export interface ComplaintHistory {
  id: string;
  complaint_id: string;
  user_id: string;
  action: string; // e.g., "status_change", "assignment", "comment", etc.
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

// Frontend complaint type (camelCase)
export interface FrontendComplaint {
  id: string;
  title: string;
  description: string;
  assetType: ComplaintAssetType;
  assetId: string;
  categoryId: string;
  subcategoryId: string | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdBy: string;
  assignedTo: string | null;
  escalatedTo: string | null;
  dueDate: string | null;
  location: any | null;
  contactMethod: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  slaBreach: boolean;
  
  // Joined fields
  categoryName?: string;
  subcategoryName?: string;
  assetName?: string;
  createdByName?: string;
  assignedToName?: string;
  escalatedToName?: string;
  
  // UI helpers
  timeToSLABreach?: string;
  daysOpen?: number;
  attachmentCount?: number;
  commentCount?: number;
}
