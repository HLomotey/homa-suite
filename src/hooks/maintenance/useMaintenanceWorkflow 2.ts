import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  MaintenanceStatus, 
  FrontendMaintenanceRequest 
} from '@/integration/supabase/types/maintenance';
import { toast } from 'sonner';
import { useCreateMaintenanceNotification } from '@/hooks/notifications/useNotifications';

type WorkflowAction = 
  | 'assign'
  | 'schedule'
  | 'start'
  | 'hold'
  | 'resume'
  | 'complete'
  | 'cancel'
  | 'reopen';

interface WorkflowActionParams {
  requestId: string;
  note?: string;
  assignedTo?: string;
  scheduledDate?: string;
}

/**
 * Hook to manage the maintenance request workflow
 */
export const useMaintenanceWorkflow = () => {
  const queryClient = useQueryClient();
  const { createForMaintenanceUpdate, createForMaintenanceAssigned } = useCreateMaintenanceNotification();

  return useMutation({
    mutationFn: async ({ 
      action, 
      requestId, 
      note, 
      assignedTo, 
      scheduledDate 
    }: WorkflowActionParams & { action: WorkflowAction }) => {
      // First, get the current request to determine the current status
      const { data: currentRequest, error: fetchError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) {
        console.error(`Error fetching maintenance request ${requestId}:`, fetchError);
        throw fetchError;
      }

      const currentStatus = currentRequest.status as MaintenanceStatus;
      let newStatus: MaintenanceStatus = currentStatus;
      let updateData: Partial<FrontendMaintenanceRequest> = {};
      let historyAction: string = 'status_change';
      let historyDetails: Record<string, any> = { from: currentStatus };
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;

      // Determine the new status and update data based on the action
      switch (action) {
        case 'assign':
          if (!assignedTo) throw new Error('Assigned user ID is required');
          newStatus = 'assigned';
          updateData = { 
            status: newStatus, 
            assignedTo,
            assignedDate: new Date().toISOString()
          };
          historyAction = 'assigned';
          historyDetails = { 
            assignedTo,
            from: currentStatus,
            to: newStatus
          };
          break;
          
        case 'schedule':
          if (!scheduledDate) throw new Error('Scheduled date is required');
          updateData = { 
            scheduledDate,
            status: currentStatus === 'new' ? 'assigned' : currentStatus
          };
          newStatus = updateData.status as MaintenanceStatus;
          historyAction = 'scheduled';
          historyDetails = { 
            scheduledDate,
            from: currentStatus,
            to: newStatus
          };
          break;
          
        case 'start':
          newStatus = 'in_progress';
          updateData = { status: newStatus };
          historyDetails.to = newStatus;
          break;
          
        case 'hold':
          newStatus = 'on_hold';
          updateData = { status: newStatus };
          historyDetails.to = newStatus;
          break;
          
        case 'resume':
          newStatus = 'in_progress';
          updateData = { status: newStatus };
          historyDetails.to = newStatus;
          break;
          
        case 'complete':
          newStatus = 'completed';
          updateData = { 
            status: newStatus,
            completedDate: new Date().toISOString()
          };
          historyDetails.to = newStatus;
          break;
          
        case 'cancel':
          newStatus = 'cancelled';
          updateData = { status: newStatus };
          historyDetails.to = newStatus;
          break;
          
        case 'reopen':
          newStatus = 'in_progress';
          updateData = { 
            status: newStatus,
            completedDate: null
          };
          historyDetails.to = newStatus;
          break;
          
        default:
          throw new Error(`Unknown workflow action: ${action}`);
      }

      // Add note to history details if provided
      if (note) {
        historyDetails.note = note;
      }

      // Update the request
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating maintenance request ${requestId}:`, error);
        throw error;
      }

      // Add history record
      const { error: historyError } = await supabase
        .from('maintenance_history')
        .insert({
          request_id: requestId,
          user_id: currentUserId,
          action: historyAction,
          details: historyDetails
        });

      if (historyError) {
        console.error('Error creating maintenance history record:', historyError);
      }
      
      // Get request details for notification
      const { data: requestDetails } = await supabase
        .from('maintenance_requests')
        .select('title, user_id')
        .eq('id', requestId)
        .single();
      
      // Send notification to the request owner
      if (requestDetails) {
        try {
          if (action === 'assign' && assignedTo) {
            // Get assigned user details
            const { data: assignedUserData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', assignedTo)
              .single();
              
            const assignedUserName = assignedUserData?.full_name || 'a maintenance staff';
            
            await createForMaintenanceAssigned({
              userId: requestDetails.user_id,
              requestId,
              requestTitle: requestDetails.title,
              assignedTo: assignedUserName
            });
          } else {
            await createForMaintenanceUpdate({
              userId: requestDetails.user_id,
              requestId,
              requestTitle: requestDetails.title,
              status: newStatus,
              note
            });
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Don't throw error here, as we don't want to fail the workflow if notification fails
        }
      }

      return { 
        requestId, 
        previousStatus: currentStatus, 
        newStatus, 
        action 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceRequests', result.requestId] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceHistory', result.requestId] });
      
      let message = '';
      switch (result.action) {
        case 'assign':
          message = 'Request assigned successfully';
          break;
        case 'schedule':
          message = 'Maintenance visit scheduled';
          break;
        case 'start':
          message = 'Work started on request';
          break;
        case 'hold':
          message = 'Request placed on hold';
          break;
        case 'resume':
          message = 'Work resumed on request';
          break;
        case 'complete':
          message = 'Request marked as completed';
          break;
        case 'cancel':
          message = 'Request cancelled';
          break;
        case 'reopen':
          message = 'Request reopened';
          break;
      }
      
      toast.success(message);
    },
    onError: (error) => {
      toast.error(`Workflow action failed: ${error.message}`);
    }
  });
};
