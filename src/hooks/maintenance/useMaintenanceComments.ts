import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  MaintenanceComment, 
  FrontendMaintenanceComment,
  mapDatabaseMaintenanceCommentToFrontend 
} from '@/integration/supabase/types/maintenance';
import { toast } from 'sonner';

/**
 * Hook to fetch comments for a specific maintenance request
 */
export const useMaintenanceComments = (requestId: string) => {
  return useQuery({
    queryKey: ['maintenanceComments', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_comments')
        .select(`
          *,
          users:user_id (email, first_name, last_name, avatar_url)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`Error fetching comments for maintenance request ${requestId}:`, error);
        throw error;
      }

      return data.map((item: any) => {
        const comment = mapDatabaseMaintenanceCommentToFrontend(item);
        
        // Add user info
        if (item.users) {
          comment.userName = item.users.first_name && item.users.last_name ? 
            `${item.users.first_name} ${item.users.last_name}` : 
            item.users.email;
          comment.userAvatar = item.users.avatar_url;
        }
        
        return comment;
      });
    },
    enabled: !!requestId
  });
};

/**
 * Hook to create a new maintenance comment
 */
export const useCreateMaintenanceComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comment: {
      requestId: string;
      comment: string;
      isPrivate: boolean;
    }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      
      const { data, error } = await supabase
        .from('maintenance_comments')
        .insert({
          request_id: comment.requestId,
          user_id: userId,
          comment: comment.comment,
          is_private: comment.isPrivate
        })
        .select(`
          *,
          users:user_id (email, first_name, last_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error creating maintenance comment:', error);
        throw error;
      }

      // Add history record for the new comment
      const { error: historyError } = await supabase
        .from('maintenance_history')
        .insert({
          request_id: comment.requestId,
          user_id: userId,
          action: 'comment_added',
          details: { comment_id: data.id, is_private: comment.isPrivate }
        });

      if (historyError) {
        console.error('Error creating maintenance history record:', historyError);
      }

      const newComment = mapDatabaseMaintenanceCommentToFrontend(data);
      
      // Add user info
      if (data.users) {
        newComment.userName = data.users.first_name && data.users.last_name ? 
          `${data.users.first_name} ${data.users.last_name}` : 
          data.users.email;
        newComment.userAvatar = data.users.avatar_url;
      }
      
      return newComment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceComments', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceHistory', variables.requestId] });
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    }
  });
};

/**
 * Hook to update an existing maintenance comment
 */
export const useUpdateMaintenanceComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      requestId,
      comment, 
      isPrivate 
    }: { 
      id: string;
      requestId: string;
      comment: string;
      isPrivate: boolean;
    }) => {
      const { data, error } = await supabase
        .from('maintenance_comments')
        .update({
          comment,
          is_private: isPrivate
        })
        .eq('id', id)
        .select(`
          *,
          users:user_id (email, first_name, last_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error(`Error updating maintenance comment with ID ${id}:`, error);
        throw error;
      }

      const updatedComment = mapDatabaseMaintenanceCommentToFrontend(data);
      
      // Add user info
      if (data.users) {
        updatedComment.userName = data.users.first_name && data.users.last_name ? 
          `${data.users.first_name} ${data.users.last_name}` : 
          data.users.email;
        updatedComment.userAvatar = data.users.avatar_url;
      }
      
      return updatedComment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceComments', variables.requestId] });
      toast.success('Comment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update comment: ${error.message}`);
    }
  });
};

/**
 * Hook to delete a maintenance comment
 */
export const useDeleteMaintenanceComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, requestId }: { id: string; requestId: string }) => {
      const { error } = await supabase
        .from('maintenance_comments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting maintenance comment with ID ${id}:`, error);
        throw error;
      }

      return { id, requestId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceComments', result.requestId] });
      toast.success('Comment deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    }
  });
};
