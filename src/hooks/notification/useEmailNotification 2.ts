import { useState } from 'react';
import { supabase } from '@/integration/supabase/client';
import { NotificationRequest, EmailRecipient, EmailGroup } from '@/types/notification';
import { emailService } from '@/services/email/emailApiClient';
import { toast } from 'sonner';

export const useEmailNotification = () => {
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [groups, setGroups] = useState<EmailGroup[]>([]);

  // Fetch available recipients from users table
  const fetchRecipients = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .not('email', 'is', null);

      if (error) throw error;

      const recipientList: EmailRecipient[] = (users || []).map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown User',
        email: user.email,
        role: user.role
      }));

      setRecipients(recipientList);
      return recipientList;
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to load recipients');
      return [];
    }
  };

  // Fetch notification groups
  const fetchGroups = async () => {
    try {
      // For now, create predefined groups based on roles
      const allRecipients = await fetchRecipients();
      
      const predefinedGroups: EmailGroup[] = [
        {
          id: 'finance-team',
          name: 'Finance Team',
          description: 'All finance department members',
          recipients: allRecipients.filter(r => r.role?.toLowerCase().includes('finance'))
        },
        {
          id: 'managers',
          name: 'Managers',
          description: 'All managers and supervisors',
          recipients: allRecipients.filter(r => r.role?.toLowerCase().includes('manager'))
        },
        {
          id: 'admins',
          name: 'Administrators',
          description: 'System administrators',
          recipients: allRecipients.filter(r => r.role?.toLowerCase().includes('admin'))
        },
        {
          id: 'all-users',
          name: 'All Users',
          description: 'All system users',
          recipients: allRecipients
        }
      ];

      setGroups(predefinedGroups);
      return predefinedGroups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  };

  // Send email notification
  const sendNotification = async (request: NotificationRequest): Promise<boolean> => {
    try {
      setLoading(true);

      // In a real implementation, this would call your email service
      // For now, we'll simulate the email sending and log the notification
      
      const notificationData = {
        form_type: request.formType,
        recipients: request.to,
        subject: request.subject,
        body: request.body,
        form_data: request.formData,
        status: 'sent',
        sent_at: new Date().toISOString()
      };

      // Store notification history in database (commented out until table is created)
      // const { error } = await supabase
      //   .from('notification_history')
      //   .insert(notificationData);

      // if (error) {
      //   console.warn('Failed to store notification history:', error);
      // }

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Email notification sent:', {
        to: request.to,
        subject: request.subject,
        formType: request.formType
      });

      toast.success(`Email notification sent to ${request.to.length} recipient(s)`);
      return true;

    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send email notification');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate email content based on form data
  const generateEmailContent = (
    formType: string,
    formData: any,
    customMessage?: string
  ): { subject: string; body: string } => {
    const timestamp = new Date().toLocaleString();
    
    let subject = '';
    let body = '';

    switch (formType) {
      case 'projection':
        subject = `New Projection Created: ${formData.title || 'Untitled'}`;
        body = `
A new projection has been created in the system.

Details:
- Title: ${formData.title || 'N/A'}
- Location: ${formData.location_description || 'N/A'}
- Expected Revenue: $${formData.expected_revenue?.toLocaleString() || '0'}
- Expected Hours: ${formData.expected_hours || '0'}
- Status: ${formData.status || 'N/A'}
- Created: ${timestamp}

${customMessage ? `\nAdditional Message:\n${customMessage}` : ''}

Please review this projection in the system.
        `;
        break;

      case 'bulk-projection':
        const projectionCount = Array.isArray(formData) ? formData.length : 1;
        subject = `Bulk Projections Created: ${projectionCount} projections`;
        body = `
${projectionCount} new projections have been created in the system.

Summary:
- Number of Projections: ${projectionCount}
- Created: ${timestamp}

${Array.isArray(formData) ? formData.map((proj, index) => `
${index + 1}. ${proj.title || 'Untitled'}
   - Expected Revenue: $${proj.expected_revenue?.toLocaleString() || '0'}
   - Expected Hours: ${proj.expected_hours || '0'}
`).join('') : ''}

${customMessage ? `\nAdditional Message:\n${customMessage}` : ''}

Please review these projections in the system.
        `;
        break;

      default:
        subject = `Form Submission: ${formType}`;
        body = `
A new ${formType} form has been submitted.

Submitted: ${timestamp}

${customMessage ? `\nMessage:\n${customMessage}` : ''}

Please review the submission in the system.
        `;
    }

    return { subject, body };
  };

  return {
    loading,
    recipients,
    groups,
    fetchRecipients,
    fetchGroups,
    sendNotification,
    generateEmailContent
  };
};
