const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const juice = require('juice');
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          ciphers: 'SSLv3'
        }
      });

      // Verify connection configuration
      await this.transporter.verify();
      logger.info('SMTP transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SMTP transporter', error);
      throw error;
    }
  }

  async sendEmail(emailRequest) {
    const startTime = Date.now();
    let attempt = 1;
    const maxRetries = parseInt(process.env.EMAIL_MAX_RETRIES) || 3;

    while (attempt <= maxRetries) {
      try {
        // Render template if template_id is provided
        let { subject, body } = emailRequest;
        if (emailRequest.template_id) {
          const rendered = await this.renderTemplate(emailRequest.template_id, emailRequest.variables || {});
          subject = rendered.subject;
          body = rendered.body;
        }

        // Add tracking pixel if enabled
        if (process.env.EMAIL_TRACKING_ENABLED === 'true') {
          const emailId = this.generateEmailId();
          body = this.addTrackingPixel(body, emailId);
          body = this.addClickTracking(body, emailId);
        }

        // Add unsubscribe link
        body = this.addUnsubscribeLink(body, emailRequest.to[0]);

        // Inline CSS for better email client compatibility
        body = juice(body);

        const mailOptions = {
          from: `${process.env.EMAIL_SENDER_NAME || 'Homa Suite'} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: emailRequest.to,
          cc: emailRequest.cc,
          bcc: emailRequest.bcc,
          subject: subject,
          html: body,
          attachments: emailRequest.attachments || []
        };

        const info = await this.transporter.sendMail(mailOptions);
        const deliveryTime = Date.now() - startTime;

        // Log successful delivery
        await this.logDelivery({
          messageId: info.messageId,
          status: 'sent',
          recipients: emailRequest.to,
          deliveryTime,
          attempt,
          provider: 'godaddy'
        });

        // Save to notification history
        await this.saveNotificationHistory({
          form_type: emailRequest.formType,
          recipients: emailRequest.to,
          subject,
          body,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

        // Update analytics
        await this.updateAnalytics({
          email_id: info.messageId,
          form_type: emailRequest.formType,
          status: 'sent',
          delivery_time: deliveryTime,
          recipient_count: emailRequest.to.length
        });

        return {
          success: true,
          messageId: info.messageId,
          deliveryTime,
          attempt
        };

      } catch (error) {
        logger.error(`Email send attempt ${attempt} failed`, error);

        if (attempt === maxRetries) {
          // Log failed delivery
          await this.logDelivery({
            status: 'failed',
            recipients: emailRequest.to,
            deliveryTime: Date.now() - startTime,
            attempt,
            provider: 'godaddy',
            error: error.message
          });

          // Save to notification history
          await this.saveNotificationHistory({
            form_type: emailRequest.formType,
            recipients: emailRequest.to,
            subject: emailRequest.subject,
            body: emailRequest.body,
            status: 'failed',
            error_message: error.message
          });

          throw error;
        }

        // Wait before retry
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
  }

  async sendBulkEmails(emailRequests) {
    const batchSize = parseInt(process.env.EMAIL_BATCH_SIZE) || 10;
    const results = [];

    for (let i = 0; i < emailRequests.length; i += batchSize) {
      const batch = emailRequests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => this.sendEmail(request));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);

        // Rate limiting between batches
        if (i + batchSize < emailRequests.length) {
          const delay = parseInt(process.env.EMAIL_BATCH_DELAY) || 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        logger.error('Batch email processing error', error);
      }
    }

    return results;
  }

  async scheduleEmail(emailRequest, scheduledAt) {
    try {
      const { data, error } = await this.supabase
        .from('email_schedules')
        .insert({
          email_request: emailRequest,
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Email scheduled successfully', { scheduleId: data.id, scheduledAt });
      return data;
    } catch (error) {
      logger.error('Failed to schedule email', error);
      throw error;
    }
  }

  async renderTemplate(templateId, variables) {
    try {
      const { data: template, error } = await this.supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!template) throw new Error('Template not found or inactive');

      const subjectTemplate = handlebars.compile(template.subject_template);
      const bodyTemplate = handlebars.compile(template.body_template);

      return {
        subject: subjectTemplate(variables),
        body: bodyTemplate(variables)
      };
    } catch (error) {
      logger.error('Template rendering error', error);
      throw error;
    }
  }

  async getTemplates(formType) {
    try {
      let query = this.supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (formType) {
        query = query.eq('form_type', formType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to get templates', error);
      throw error;
    }
  }

  async createTemplate(templateData) {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .insert({
          ...templateData,
          variables: this.extractVariables(templateData.subject_template + ' ' + templateData.body_template)
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to create template', error);
      throw error;
    }
  }

  async updateTemplate(id, templateData) {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .update({
          ...templateData,
          variables: this.extractVariables(templateData.subject_template + ' ' + templateData.body_template),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to update template', error);
      throw error;
    }
  }

  async deleteTemplate(id) {
    try {
      const { error } = await this.supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to delete template', error);
      throw error;
    }
  }

  async getNotificationHistory(options = {}) {
    try {
      const { page = 1, limit = 20, form_type, status } = options;
      const offset = (page - 1) * limit;

      let query = this.supabase
        .from('notification_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (form_type) {
        query = query.eq('form_type', form_type);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get notification history', error);
      throw error;
    }
  }

  async getEmailAnalytics(options = {}) {
    try {
      const { startDate, endDate, form_type } = options;

      let query = this.supabase
        .from('email_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      if (form_type) {
        query = query.eq('form_type', form_type);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate summary statistics
      const analytics = data || [];
      const summary = {
        totalEmails: analytics.length,
        sentEmails: analytics.filter(a => a.status === 'sent').length,
        failedEmails: analytics.filter(a => a.status === 'failed').length,
        averageDeliveryTime: analytics.reduce((sum, a) => sum + (a.delivery_time || 0), 0) / analytics.length || 0,
        totalRecipients: analytics.reduce((sum, a) => sum + (a.recipient_count || 0), 0)
      };

      return {
        summary,
        details: analytics
      };
    } catch (error) {
      logger.error('Failed to get email analytics', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }
      
      await this.transporter.verify();
      return { connected: true, message: 'SMTP connection successful' };
    } catch (error) {
      logger.error('SMTP connection test failed', error);
      throw error;
    }
  }

  async sendTestEmail(to) {
    const testEmailRequest = {
      to: [to],
      subject: 'Homa Suite - Test Email',
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Test Email from Homa Suite</h2>
              <p>This is a test email to verify your SMTP configuration is working correctly.</p>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
              <p>If you received this email, your email notification system is configured properly!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                This is an automated test email from Homa Suite Email Notification System.
              </p>
            </div>
          </body>
        </html>
      `,
      formType: 'test'
    };

    return await this.sendEmail(testEmailRequest);
  }

  // Helper methods
  generateEmailId() {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addTrackingPixel(body, emailId) {
    const trackingUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/email/track/open/${emailId}`;
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="">`;
    
    // Insert before closing body tag
    return body.replace('</body>', `${trackingPixel}</body>`);
  }

  addClickTracking(body, emailId) {
    // Simple click tracking - replace all links with tracking URLs
    return body.replace(
      /<a\s+href="([^"]+)"/g,
      (match, url) => {
        const trackingUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/email/track/click/${emailId}/${Date.now()}?url=${encodeURIComponent(url)}`;
        return `<a href="${trackingUrl}"`;
      }
    );
  }

  addUnsubscribeLink(body, email) {
    const unsubscribeToken = Buffer.from(email).toString('base64');
    const unsubscribeUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/unsubscribe?token=${unsubscribeToken}`;
    const unsubscribeLink = `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>If you no longer wish to receive these emails, you can <a href="${unsubscribeUrl}">unsubscribe here</a>.</p>
      </div>
    `;
    
    // Insert before closing body tag
    return body.replace('</body>', `${unsubscribeLink}</body>`);
  }

  extractVariables(template) {
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, '').trim());
  }

  async logDelivery(deliveryData) {
    try {
      const { error } = await this.supabase
        .from('email_delivery_logs')
        .insert({
          ...deliveryData,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to log email delivery', error);
      }
    } catch (error) {
      logger.error('Failed to log email delivery', error);
    }
  }

  async saveNotificationHistory(historyData) {
    try {
      const { error } = await this.supabase
        .from('notification_history')
        .insert({
          ...historyData,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to save notification history', error);
      }
    } catch (error) {
      logger.error('Failed to save notification history', error);
    }
  }

  async updateAnalytics(analyticsData) {
    try {
      const { error } = await this.supabase
        .from('email_analytics')
        .insert({
          ...analyticsData,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to update email analytics', error);
      }
    } catch (error) {
      logger.error('Failed to update email analytics', error);
    }
  }
}

module.exports = EmailService;
