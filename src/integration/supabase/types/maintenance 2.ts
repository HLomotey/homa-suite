/**
 * Maintenance types for Supabase integration
 * These types define the maintenance request structure and related interfaces
 */

import { Json } from './database';

/**
 * MaintenanceCategory interface representing the maintenance_categories table in Supabase
 */
export interface MaintenanceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * MaintenancePriority interface representing the maintenance_priorities table in Supabase
 */
export interface MaintenancePriority {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  sla_hours: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * MaintenanceRequest interface representing the maintenance_requests table in Supabase
 */
export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  tenant_id: string | null;
  property_id: string;
  room_id: string | null;
  category_id: string;
  priority_id: string;
  status: string;
  reported_date: string;
  assigned_date: string | null;
  assigned_to: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  is_emergency: boolean;
  permission_to_enter: boolean;
  tenant_available_times: Json | null;
  images: Json | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * MaintenanceComment interface representing the maintenance_comments table in Supabase
 */
export interface MaintenanceComment {
  id: string;
  request_id: string;
  user_id: string;
  comment: string;
  is_private: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * MaintenanceHistory interface representing the maintenance_history table in Supabase
 */
export interface MaintenanceHistory {
  id: string;
  request_id: string;
  user_id: string;
  action: string;
  details: Json | null;
  created_at: string;
}

/**
 * MaintenanceAttachment interface representing the maintenance_attachments table in Supabase
 */
export interface MaintenanceAttachment {
  id: string;
  request_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

/**
 * MaintenanceStatus enum
 */
export type MaintenanceStatus = 'new' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

/**
 * MaintenanceAction enum for history tracking
 */
export type MaintenanceAction = 'status_change' | 'comment_added' | 'assigned' | 'scheduled' | 'completed' | 'attachment_added';

/**
 * Frontend maintenance category type
 */
export interface FrontendMaintenanceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
}

/**
 * Frontend maintenance priority type
 */
export interface FrontendMaintenancePriority {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  slaHours: number | null;
  isActive: boolean;
}

/**
 * Frontend maintenance request type
 */
export interface FrontendMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  tenantId: string | null;
  propertyId: string;
  roomId: string | null;
  categoryId: string;
  priorityId: string;
  status: MaintenanceStatus;
  reportedDate: string;
  assignedDate: string | null;
  assignedTo: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  isEmergency: boolean;
  permissionToEnter: boolean;
  tenantAvailableTimes: any | null;
  images: string[] | null;
  staffNotes?: string | null;
  
  // These fields will be populated from related tables
  tenantName?: string;
  propertyName?: string;
  roomName?: string;
  categoryName?: string;
  priorityName?: string;
  priorityColor?: string;
  assignedToName?: string;
  
  // Additional fields for UI display
  comments?: {
    id: string;
    content: string;
    userName: string;
    createdAt: string;
  }[];
  
  timeline?: {
    date: string;
    title: string;
    description?: string;
  }[];
}

/**
 * Frontend maintenance comment type
 */
export interface FrontendMaintenanceComment {
  id: string;
  requestId: string;
  userId: string;
  comment: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string | null;
  
  // These fields will be populated from related tables
  userName?: string;
  userAvatar?: string;
}

/**
 * Frontend maintenance history type
 */
export interface FrontendMaintenanceHistory {
  id: string;
  requestId: string;
  userId: string;
  action: MaintenanceAction;
  details: any | null;
  createdAt: string;
  
  // These fields will be populated from related tables
  userName?: string;
}

/**
 * Frontend maintenance attachment type
 */
export interface FrontendMaintenanceAttachment {
  id: string;
  requestId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
  
  // These fields will be populated from related tables
  uploadedByName?: string;
}

/**
 * Maps a database maintenance category to the frontend format
 */
export const mapDatabaseMaintenanceCategoryToFrontend = (
  dbCategory: MaintenanceCategory
): FrontendMaintenanceCategory => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description,
    icon: dbCategory.icon,
    isActive: dbCategory.is_active
  };
};

/**
 * Maps a database maintenance priority to the frontend format
 */
export const mapDatabaseMaintenancePriorityToFrontend = (
  dbPriority: MaintenancePriority
): FrontendMaintenancePriority => {
  return {
    id: dbPriority.id,
    name: dbPriority.name,
    description: dbPriority.description,
    color: dbPriority.color,
    slaHours: dbPriority.sla_hours,
    isActive: dbPriority.is_active
  };
};

/**
 * Maps a database maintenance request to the frontend format
 */
export const mapDatabaseMaintenanceRequestToFrontend = (
  dbRequest: MaintenanceRequest
): FrontendMaintenanceRequest => {
  return {
    id: dbRequest.id,
    title: dbRequest.title,
    description: dbRequest.description,
    tenantId: dbRequest.tenant_id,
    propertyId: dbRequest.property_id,
    roomId: dbRequest.room_id,
    categoryId: dbRequest.category_id,
    priorityId: dbRequest.priority_id,
    status: dbRequest.status as MaintenanceStatus,
    reportedDate: dbRequest.reported_date,
    assignedDate: dbRequest.assigned_date,
    assignedTo: dbRequest.assigned_to,
    scheduledDate: dbRequest.scheduled_date,
    completedDate: dbRequest.completed_date,
    isEmergency: dbRequest.is_emergency,
    permissionToEnter: dbRequest.permission_to_enter,
    tenantAvailableTimes: dbRequest.tenant_available_times as any,
    images: dbRequest.images as string[] | null
  };
};

/**
 * Maps a database maintenance comment to the frontend format
 */
export const mapDatabaseMaintenanceCommentToFrontend = (
  dbComment: MaintenanceComment
): FrontendMaintenanceComment => {
  return {
    id: dbComment.id,
    requestId: dbComment.request_id,
    userId: dbComment.user_id,
    comment: dbComment.comment,
    isPrivate: dbComment.is_private,
    createdAt: dbComment.created_at,
    updatedAt: dbComment.updated_at
  };
};

/**
 * Maps a database maintenance history to the frontend format
 */
export const mapDatabaseMaintenanceHistoryToFrontend = (
  dbHistory: MaintenanceHistory
): FrontendMaintenanceHistory => {
  return {
    id: dbHistory.id,
    requestId: dbHistory.request_id,
    userId: dbHistory.user_id,
    action: dbHistory.action as MaintenanceAction,
    details: dbHistory.details,
    createdAt: dbHistory.created_at
  };
};

/**
 * Maps a database maintenance attachment to the frontend format
 */
export const mapDatabaseMaintenanceAttachmentToFrontend = (
  dbAttachment: MaintenanceAttachment
): FrontendMaintenanceAttachment => {
  return {
    id: dbAttachment.id,
    requestId: dbAttachment.request_id,
    fileName: dbAttachment.file_name,
    fileType: dbAttachment.file_type,
    fileSize: dbAttachment.file_size,
    fileUrl: dbAttachment.file_url,
    uploadedBy: dbAttachment.uploaded_by,
    createdAt: dbAttachment.created_at
  };
};

/**
 * Maps a frontend maintenance request to the database format
 */
export const mapFrontendMaintenanceRequestToDatabase = (
  frontendRequest: Omit<FrontendMaintenanceRequest, "id" | "tenantName" | "propertyName" | "roomName" | "categoryName" | "priorityName" | "priorityColor" | "assignedToName">
): Omit<MaintenanceRequest, "id" | "created_at" | "updated_at"> => {
  return {
    title: frontendRequest.title,
    description: frontendRequest.description,
    tenant_id: frontendRequest.tenantId,
    property_id: frontendRequest.propertyId,
    room_id: frontendRequest.roomId,
    category_id: frontendRequest.categoryId,
    priority_id: frontendRequest.priorityId,
    status: frontendRequest.status,
    reported_date: frontendRequest.reportedDate,
    assigned_date: frontendRequest.assignedDate,
    assigned_to: frontendRequest.assignedTo,
    scheduled_date: frontendRequest.scheduledDate,
    completed_date: frontendRequest.completedDate,
    is_emergency: frontendRequest.isEmergency,
    permission_to_enter: frontendRequest.permissionToEnter,
    tenant_available_times: frontendRequest.tenantAvailableTimes as Json,
    images: frontendRequest.images as Json
  };
};
