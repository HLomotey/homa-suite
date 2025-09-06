export interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface EmailGroup {
  id: string;
  name: string;
  description?: string;
  recipients: EmailRecipient[];
}

export interface EmailNotificationConfig {
  enabled: boolean;
  recipients: EmailRecipient[];
  groups: EmailGroup[];
  subject: string;
  message: string;
  includeFormData: boolean;
  sendOnSubmit: boolean;
  sendOnUpdate: boolean;
  sendOnDelete: boolean;
}

export interface NotificationRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  formType: string;
  formData?: any;
  template_id?: string;
  variables?: Record<string, any>;
}

export interface EmailNotificationRequest extends NotificationRequest {
  id?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  priority?: 'high' | 'normal' | 'low';
  scheduledAt?: Date;
  tags?: string[];
}

export interface EmailDeliveryStatus {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryTime: number;
  attempt: number;
  provider: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  form_type: string;
  subject_template: string;
  body_template: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface NotificationHistory {
  id: string;
  form_type: string;
  recipients: string[];
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at?: string;
  created_at: string;
  error_message?: string;
}

export interface EmailAnalytics {
  id: string;
  email_id: string;
  form_type: string;
  status: string;
  delivery_time: number;
  recipient_count: number;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

export interface EmailSchedule {
  id: string;
  email_request: EmailNotificationRequest;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  last_attempt_at?: string;
  created_at: string;
}
