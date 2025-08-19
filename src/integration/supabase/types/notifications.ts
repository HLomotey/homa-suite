/**
 * Notification type definitions for Supabase integration
 * This file consolidates all notification related types
 */

import { Json } from './database';

/**
 * Notification interface representing the notifications table in Supabase
 */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_entity_type: EntityType;
  related_entity_id: string;
  metadata: Json | null;
  is_read: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Notification type enum
 */
export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'maintenance_update'
  | 'maintenance_assigned'
  | 'maintenance_scheduled'
  | 'maintenance_completed'
  | 'maintenance_canceled';

/**
 * Entity type enum for related entities
 */
export type EntityType = 
  | 'maintenance_request'
  | 'property'
  | 'room'
  | 'tenant'
  | 'lease'
  | 'payment'
  | 'system';

/**
 * Frontend notification type
 */
export interface FrontendNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityType: EntityType;
  relatedEntityId: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Maps a database notification to the frontend notification format
 */
export const mapDatabaseNotificationToFrontend = (dbNotification: Notification): FrontendNotification => {
  return {
    id: dbNotification.id,
    userId: dbNotification.user_id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type,
    relatedEntityType: dbNotification.related_entity_type,
    relatedEntityId: dbNotification.related_entity_id,
    metadata: dbNotification.metadata as Record<string, any> | undefined,
    isRead: dbNotification.is_read,
    createdAt: dbNotification.created_at,
    updatedAt: dbNotification.updated_at || undefined
  };
};

/**
 * Maps a frontend notification to the database notification format
 */
export const mapFrontendNotificationToDatabase = (frontendNotification: Omit<FrontendNotification, 'id'>): Omit<Notification, 'id' | 'created_at' | 'updated_at'> => {
  return {
    user_id: frontendNotification.userId,
    title: frontendNotification.title,
    message: frontendNotification.message,
    type: frontendNotification.type,
    related_entity_type: frontendNotification.relatedEntityType,
    related_entity_id: frontendNotification.relatedEntityId,
    metadata: frontendNotification.metadata || null,
    is_read: frontendNotification.isRead
  };
};
