/**
 * Email Service for sending security deposit refund reports
 */

import { EmailNotificationRequest } from '@/integration/supabase/types/refund-decision';

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'noreply@bohhousing.com';
  private static readonly COMPANY_NAME = 'BOH Housing Services';

  /**
   * Send refund decision email with PDF attachment
   */
  static async sendRefundDecisionEmail(
    request: EmailNotificationRequest,
    pdfBlob: Blob,
    pdfFilename: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create email template
      const template = this.createRefundDecisionTemplate(
        request.tenant_name,
        request.property_name,
        request.decision_type,
        request.refund_amount
      );

      // Prepare form data for email API
      const formData = new FormData();
      formData.append('to', request.recipients.join(','));
      formData.append('subject', template.subject);
      formData.append('html', template.htmlBody);
      formData.append('text', template.textBody);
      formData.append('attachment', pdfBlob, pdfFilename);

      // Send email via backend API
      const response = await fetch('/api/email/send-refund-report', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const result = await response.json();
      return { success: true };

    } catch (error) {
      console.error('Error sending refund decision email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Create email template for refund decision
   */
  private static createRefundDecisionTemplate(
    tenantName: string,
    propertyName: string,
    decisionType: string,
    refundAmount: number
  ): EmailTemplate {
    const subject = `Security Deposit ${decisionType} - ${tenantName}`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .decision-box { 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 5px; 
            text-align: center;
            font-weight: bold;
            font-size: 18px;
          }
          .approved { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
          .denied { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
          .partial { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
          .footer { background-color: #34495e; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .info-table th, .info-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .info-table th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.COMPANY_NAME}</h1>
            <h2>Security Deposit Assessment Report</h2>
          </div>
          
          <div class="content">
            <p>Dear ${tenantName},</p>
            
            <p>We have completed the assessment of your security deposit for your stay at ${propertyName}. 
            Please find the details below and the complete assessment report attached.</p>
            
            <div class="decision-box ${decisionType.toLowerCase()}">
              Decision: ${decisionType.toUpperCase()}
              <br>
              Refund Amount: $${refundAmount.toFixed(2)}
            </div>
            
            <table class="info-table">
              <tr>
                <th>Property</th>
                <td>${propertyName}</td>
              </tr>
              <tr>
                <th>Decision Type</th>
                <td>${decisionType}</td>
              </tr>
              <tr>
                <th>Refund Amount</th>
                <td>$${refundAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Assessment Date</th>
                <td>${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
            
            ${this.getDecisionSpecificMessage(decisionType, refundAmount)}
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              ${this.getNextSteps(decisionType)}
            </ul>
            
            <p>The attached PDF report contains the complete assessment details, including:</p>
            <ul>
              <li>Property condition evaluation</li>
              <li>Cleaning assessment</li>
              <li>Personal items verification</li>
              <li>House rules compliance review</li>
              <li>Detailed deduction breakdown (if applicable)</li>
            </ul>
            
            <p>If you have any questions about this assessment or need to discuss the decision, 
            please contact our Housing Services team at housing@bohhousing.com or call (555) 123-4567.</p>
            
            <p>Thank you for your stay with ${this.COMPANY_NAME}.</p>
            
            <p>Best regards,<br>
            Housing Services Team<br>
            ${this.COMPANY_NAME}</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from ${this.COMPANY_NAME} Housing Management System.</p>
            <p>Please do not reply to this email. For assistance, contact housing@bohhousing.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
${this.COMPANY_NAME}
Security Deposit Assessment Report

Dear ${tenantName},

We have completed the assessment of your security deposit for your stay at ${propertyName}.

DECISION: ${decisionType.toUpperCase()}
REFUND AMOUNT: $${refundAmount.toFixed(2)}

Property: ${propertyName}
Assessment Date: ${new Date().toLocaleDateString()}

${this.getDecisionSpecificMessageText(decisionType, refundAmount)}

The attached PDF report contains complete assessment details including property condition, cleaning assessment, personal items verification, house rules compliance, and deduction breakdown.

For questions, contact housing@bohhousing.com or call (555) 123-4567.

Best regards,
Housing Services Team
${this.COMPANY_NAME}

---
This is an automated message. Please do not reply to this email.
    `;

    return { subject, htmlBody, textBody };
  }

  private static getDecisionSpecificMessage(decisionType: string, refundAmount: number): string {
    switch (decisionType.toLowerCase()) {
      case 'approved':
        return `
          <p><strong>Good news!</strong> Your security deposit assessment has been approved for a full refund. 
          The refund amount of $${refundAmount.toFixed(2)} will be processed within 5-7 business days.</p>
        `;
      case 'denied':
        return `
          <p><strong>Important:</strong> Unfortunately, your security deposit refund has been denied due to 
          violations or damages identified during the assessment. Please review the detailed report for specific reasons.</p>
        `;
      case 'partial':
        return `
          <p><strong>Partial Refund:</strong> Your security deposit assessment resulted in a partial refund of 
          $${refundAmount.toFixed(2)} after deducting costs for damages, cleaning, or other violations identified during inspection.</p>
        `;
      default:
        return '<p>Please review the attached assessment report for complete details.</p>';
    }
  }

  private static getDecisionSpecificMessageText(decisionType: string, refundAmount: number): string {
    switch (decisionType.toLowerCase()) {
      case 'approved':
        return `Good news! Full refund of $${refundAmount.toFixed(2)} approved. Processing within 5-7 business days.`;
      case 'denied':
        return 'Security deposit refund denied due to violations/damages. See detailed report.';
      case 'partial':
        return `Partial refund of $${refundAmount.toFixed(2)} after deductions for damages/violations.`;
      default:
        return 'Please review the assessment report for details.';
    }
  }

  private static getNextSteps(decisionType: string): string {
    switch (decisionType.toLowerCase()) {
      case 'approved':
        return `
          <li>Your refund will be processed within 5-7 business days</li>
          <li>Funds will be returned via the same method used for the original deposit</li>
          <li>You will receive a confirmation email once the refund is processed</li>
        `;
      case 'denied':
        return `
          <li>Review the detailed assessment report attached</li>
          <li>Contact Housing Services if you wish to dispute any findings</li>
          <li>Appeals must be submitted within 30 days of this notification</li>
        `;
      case 'partial':
        return `
          <li>Your partial refund will be processed within 5-7 business days</li>
          <li>Review the deduction breakdown in the attached report</li>
          <li>Contact Housing Services if you have questions about specific deductions</li>
        `;
      default:
        return '<li>Contact Housing Services for next steps</li>';
    }
  }

  /**
   * Send HR review notification
   */
  static async sendHRReviewNotification(
    refundDecisionId: string,
    tenantName: string,
    propertyName: string,
    hrEmails: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = `HR Review Required - Security Deposit Assessment: ${tenantName}`;
      
      const htmlBody = `
        <h2>${this.COMPANY_NAME} - HR Review Required</h2>
        <p>A security deposit assessment requires HR review:</p>
        <ul>
          <li><strong>Tenant:</strong> ${tenantName}</li>
          <li><strong>Property:</strong> ${propertyName}</li>
          <li><strong>Decision ID:</strong> ${refundDecisionId}</li>
        </ul>
        <p>Please log into the Housing Management System to review and approve this assessment.</p>
      `;

      const response = await fetch('/api/email/send-hr-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: hrEmails,
          subject,
          html: htmlBody
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send HR notification');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
