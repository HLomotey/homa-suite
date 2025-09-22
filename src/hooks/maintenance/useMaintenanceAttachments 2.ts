import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integration/supabase';
import { 
  FrontendMaintenanceAttachment,
  mapDatabaseMaintenanceAttachmentToFrontend 
} from '@/integration/supabase/types/maintenance';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to fetch attachments for a specific maintenance request
 */
export const useMaintenanceAttachments = (requestId: string) => {
  return useQuery({
    queryKey: ['maintenanceAttachments', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_attachments')
        .select(`
          *,
          users:uploaded_by (email, first_name, last_name)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching attachments for maintenance request ${requestId}:`, error);
        throw error;
      }

      return data.map((item: any) => {
        const attachment = mapDatabaseMaintenanceAttachmentToFrontend(item);
        
        // Add user info
        if (item.users) {
          attachment.uploadedByName = item.users.first_name && item.users.last_name ? 
            `${item.users.first_name} ${item.users.last_name}` : 
            item.users.email;
        }
        
        return attachment;
      });
    },
    enabled: !!requestId
  });
};

/**
 * Hook to upload a new attachment for a maintenance request
 */
export const useUploadMaintenanceAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      file 
    }: { 
      requestId: string;
      file: File;
    }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `maintenance/${requestId}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      const fileUrl = publicUrlData.publicUrl;
      
      // Create attachment record in database
      const { data, error } = await supabase
        .from('maintenance_attachments')
        .insert({
          request_id: requestId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: fileUrl,
          uploaded_by: userId
        })
        .select(`
          *,
          users:uploaded_by (email, first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Error creating attachment record:', error);
        throw error;
      }

      // Add history record for the new attachment
      const { error: historyError } = await supabase
        .from('maintenance_history')
        .insert({
          request_id: requestId,
          user_id: userId,
          action: 'attachment_added',
          details: { attachment_id: data.id, file_name: file.name }
        });

      if (historyError) {
        console.error('Error creating maintenance history record:', historyError);
      }

      const attachment = mapDatabaseMaintenanceAttachmentToFrontend(data);
      
      // Add user info
      if (data.users) {
        attachment.uploadedByName = data.users.first_name && data.users.last_name ? 
          `${data.users.first_name} ${data.users.last_name}` : 
          data.users.email;
      }
      
      return attachment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceAttachments', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceHistory', variables.requestId] });
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    }
  });
};

/**
 * Hook to delete a maintenance attachment
 */
export const useDeleteMaintenanceAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      requestId, 
      filePath 
    }: { 
      id: string;
      requestId: string;
      filePath: string;
    }) => {
      // Extract the path from the URL
      const path = filePath.split('/').slice(-3).join('/');
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        throw storageError;
      }
      
      // Delete attachment record from database
      const { error } = await supabase
        .from('maintenance_attachments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting maintenance attachment with ID ${id}:`, error);
        throw error;
      }

      return { id, requestId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceAttachments', result.requestId] });
      toast.success('File deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete file: ${error.message}`);
    }
  });
};
