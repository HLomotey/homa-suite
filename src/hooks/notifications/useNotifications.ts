import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  Notification, 
  NotificationType,
  EntityType,
  mapDatabaseNotificationToFrontend,
  mapFrontendNotificationToDatabase
} from '@/integration/supabase/types/notifications';
import { toast } from 'sonner';

/**
 * Hook to fetch all notifications for the current user
 */
export const useNotifications = (filters?: {
  isRead?: boolean;
  type?: NotificationType | NotificationType[];
  relatedEntityType?: EntityType;
  relatedEntityId?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters if provided
      if (filters?.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      
      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type);
        } else {
          query = query.eq('type', filters.type);
        }
      }
      
      if (filters?.relatedEntityType) {
        query = query.eq('related_entity_type', filters.relatedEntityType);
      }
      
      if (filters?.relatedEntityId) {
        query = query.eq('related_entity_id', filters.relatedEntityId);
      }
      
      // Order by creation date descending (newest first)
      query = query.order('created_at', { ascending: false });
      
      // Apply limit if provided
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data.map((item: Notification) => mapDatabaseNotificationToFrontend(item));
    }
  });
};

/**
 * Hook to create a new notification
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      return mapDatabaseNotificationToFrontend(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to create notification:', error);
    }
  });
};

/**
 * Hook to mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error(`Error marking notification as read with ID ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    }
  });
};

/**
 * Hook to mark all notifications as read for the current user
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(`Failed to mark all notifications as read: ${error.message}`);
    }
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting notification with ID ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    }
  });
};

/**
 * Hook to get unread notification count
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error counting unread notifications:', error);
        throw error;
      }

      return count || 0;
    }
  });
};

/**
 * Hook to create a maintenance notification
 * This is a specialized hook for creating maintenance-related notifications
 */
export const useCreateMaintenanceNotification = () => {
  const createNotification = useCreateNotification();
  
  const createForMaintenanceUpdate = async ({
    userId,
    requestId,
    requestTitle,
    status,
    note
  }: {
    userId: string;
    requestId: string;
    requestTitle: string;
    status: string;
    note?: string;
  }) => {
    let type: NotificationType = 'maintenance_update';
    let title = 'Maintenance Request Updated';
    let message = `Maintenance request "${requestTitle}" has been updated to status: ${status}`;
    
    // Determine notification type based on status
    if (status === 'completed') {
      type = 'maintenance_completed';
      title = 'Maintenance Request Completed';
      message = `Your maintenance request "${requestTitle}" has been completed.`;
    } else if (status === 'canceled') {
      type = 'maintenance_canceled';
      title = 'Maintenance Request Canceled';
      message = `Your maintenance request "${requestTitle}" has been canceled.`;
    } else if (status === 'scheduled') {
      type = 'maintenance_scheduled';
      title = 'Maintenance Request Scheduled';
      message = `Your maintenance request "${requestTitle}" has been scheduled.`;
    } else if (status === 'in_progress') {
      title = 'Maintenance In Progress';
      message = `Work on your maintenance request "${requestTitle}" has started.`;
    } else if (status === 'on_hold') {
      title = 'Maintenance On Hold';
      message = `Your maintenance request "${requestTitle}" has been placed on hold.`;
    }
    
    // Add note if provided
    if (note) {
      message += ` Note: ${note}`;
    }
    
    return createNotification.mutateAsync({
      user_id: userId,
      title,
      message,
      type,
      related_entity_type: 'maintenance_request',
      related_entity_id: requestId,
      metadata: { status, note },
      is_read: false
    });
  };
  
  const createForMaintenanceAssigned = async ({
    userId,
    requestId,
    requestTitle,
    assignedTo
  }: {
    userId: string;
    requestId: string;
    requestTitle: string;
    assignedTo: string;
  }) => {
    return createNotification.mutateAsync({
      user_id: userId,
      title: 'Maintenance Request Assigned',
      message: `Maintenance request "${requestTitle}" has been assigned to ${assignedTo}.`,
      type: 'maintenance_assigned',
      related_entity_type: 'maintenance_request',
      related_entity_id: requestId,
      metadata: { assignedTo },
      is_read: false
    });
  };
  
  return {
    createForMaintenanceUpdate,
    createForMaintenanceAssigned,
    ...createNotification
  };
};
