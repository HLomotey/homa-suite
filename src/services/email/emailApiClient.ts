import { 
  EmailTemplate, 
  EmailNotificationRequest, 
  EmailDeliveryStatus,
  NotificationHistory,
  EmailAnalytics 
} from '@/types/notification';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class EmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/email`;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async sendEmail(request: EmailNotificationRequest): Promise<EmailDeliveryStatus> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        messageId: string;
        deliveryTime: number;
      }>('/send', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return {
        success: response.success,
        messageId: response.messageId,
        deliveryTime: response.deliveryTime,
        attempt: 1,
        provider: 'godaddy'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryTime: 0,
        attempt: 1,
        provider: 'godaddy'
      };
    }
  }

  async sendBulkEmails(requests: EmailNotificationRequest[]): Promise<EmailDeliveryStatus[]> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        results: EmailDeliveryStatus[];
      }>('/send-bulk', {
        method: 'POST',
        body: JSON.stringify(requests),
      });

      return response.results;
    } catch (error) {
      // Return failed status for all requests
      return requests.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Bulk send failed',
        deliveryTime: 0,
        attempt: 1,
        provider: 'godaddy'
      }));
    }
  }

  async scheduleEmail(request: EmailNotificationRequest, scheduledAt: Date): Promise<{ success: boolean; scheduleId?: string }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        scheduleId: string;
      }>('/schedule', {
        method: 'POST',
        body: JSON.stringify({
          ...request,
          scheduledAt: scheduledAt.toISOString()
        }),
      });

      return {
        success: response.success,
        scheduleId: response.scheduleId
      };
    } catch (error) {
      return {
        success: false
      };
    }
  }

  async getTemplates(formType?: string): Promise<EmailTemplate[]> {
    try {
      const queryParams = formType ? `?form_type=${encodeURIComponent(formType)}` : '';
      const response = await this.makeRequest<{
        success: boolean;
        templates: EmailTemplate[];
      }>(`/templates${queryParams}`);

      return response.templates || [];
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  }

  async createTemplate(templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate | null> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        template: EmailTemplate;
      }>('/templates', {
        method: 'POST',
        body: JSON.stringify(templateData),
      });

      return response.template;
    } catch (error) {
      console.error('Failed to create template:', error);
      return null;
    }
  }

  async updateTemplate(id: string, templateData: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        template: EmailTemplate;
      }>(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(templateData),
      });

      return response.template;
    } catch (error) {
      console.error('Failed to update template:', error);
      return null;
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      await this.makeRequest<{
        success: boolean;
      }>(`/templates/${id}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  async getNotificationHistory(options: {
    page?: number;
    limit?: number;
    form_type?: string;
    status?: string;
  } = {}): Promise<{
    data: NotificationHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.set('page', options.page.toString());
      if (options.limit) queryParams.set('limit', options.limit.toString());
      if (options.form_type) queryParams.set('form_type', options.form_type);
      if (options.status) queryParams.set('status', options.status);

      const response = await this.makeRequest<{
        success: boolean;
        data: NotificationHistory[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/history?${queryParams.toString()}`);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  async getEmailAnalytics(options: {
    startDate?: Date;
    endDate?: Date;
    form_type?: string;
  } = {}): Promise<{
    summary: {
      totalEmails: number;
      sentEmails: number;
      failedEmails: number;
      averageDeliveryTime: number;
      totalRecipients: number;
    };
    details: EmailAnalytics[];
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (options.startDate) queryParams.set('startDate', options.startDate.toISOString());
      if (options.endDate) queryParams.set('endDate', options.endDate.toISOString());
      if (options.form_type) queryParams.set('form_type', options.form_type);

      const response = await this.makeRequest<{
        success: boolean;
        analytics: {
          summary: {
            totalEmails: number;
            sentEmails: number;
            failedEmails: number;
            averageDeliveryTime: number;
            totalRecipients: number;
          };
          details: EmailAnalytics[];
        };
      }>(`/analytics?${queryParams.toString()}`);

      return response.analytics || {
        summary: {
          totalEmails: 0,
          sentEmails: 0,
          failedEmails: 0,
          averageDeliveryTime: 0,
          totalRecipients: 0
        },
        details: []
      };
    } catch (error) {
      console.error('Failed to get email analytics:', error);
      return {
        summary: {
          totalEmails: 0,
          sentEmails: 0,
          failedEmails: 0,
          averageDeliveryTime: 0,
          totalRecipients: 0
        },
        details: []
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
      }>('/test-connection', {
        method: 'POST',
      });

      return response.success;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        messageId: string;
      }>('/test-send', {
        method: 'POST',
        body: JSON.stringify({ to }),
      });

      return {
        success: response.success,
        messageId: response.messageId
      };
    } catch (error) {
      console.error('Failed to send test email:', error);
      return {
        success: false
      };
    }
  }

  // Legacy method for compatibility with existing code
  async queueEmail(request: EmailNotificationRequest): Promise<void> {
    // For now, just send immediately
    await this.sendEmail(request);
  }

  // Legacy method for compatibility with existing code
  async getEmailStats(days: number = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const analytics = await this.getEmailAnalytics({
      startDate,
      endDate
    });

    return {
      total: analytics.summary.totalEmails,
      sent: analytics.summary.sentEmails,
      failed: analytics.summary.failedEmails,
      avgDeliveryTime: analytics.summary.averageDeliveryTime,
      byFormType: analytics.details.reduce((acc, d) => {
        acc[d.form_type] = (acc[d.form_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const emailService = new EmailService();
export { EmailService };
