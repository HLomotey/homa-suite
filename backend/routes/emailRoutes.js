const express = require('express');
const { body, validationResult } = require('express-validator');
const EmailService = require('../services/EmailService');
const EmailQueue = require('../services/EmailQueue');
const { logger } = require('../utils/logger');

const router = express.Router();
const emailService = new EmailService();
const emailQueue = new EmailQueue();

// Validation middleware
const validateEmailRequest = [
  body('to').isArray().withMessage('Recipients must be an array'),
  body('to.*').isEmail().withMessage('Invalid email address'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('body').notEmpty().withMessage('Email body is required'),
  body('formType').notEmpty().withMessage('Form type is required')
];

const validateTemplateRequest = [
  body('name').notEmpty().withMessage('Template name is required'),
  body('form_type').notEmpty().withMessage('Form type is required'),
  body('subject_template').notEmpty().withMessage('Subject template is required'),
  body('body_template').notEmpty().withMessage('Body template is required')
];

// Send email endpoint
router.post('/send', validateEmailRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const emailRequest = req.body;
    
    // Use queue for better performance and reliability
    if (process.env.USE_EMAIL_QUEUE === 'true') {
      const result = await emailQueue.addEmailJob(emailRequest);
      res.status(200).json({
        success: true,
        jobId: result.jobId,
        message: 'Email queued for processing'
      });
    } else {
      const result = await emailService.sendEmail(emailRequest);
      res.status(200).json({
        success: true,
        messageId: result.messageId,
        deliveryTime: result.deliveryTime
      });
    }

  } catch (error) {
    logger.error('Email send error', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

// Send bulk emails endpoint
router.post('/send-bulk', [body('emails').isArray().withMessage('Emails must be an array')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { emails } = req.body;
    
    // Use queue for bulk emails for better performance
    if (process.env.USE_EMAIL_QUEUE === 'true') {
      const result = await emailQueue.addBulkEmailJob(emails);
      res.status(200).json({
        success: true,
        jobId: result.jobId,
        message: 'Bulk emails queued for processing'
      });
    } else {
      const results = await emailService.sendBulkEmails(emails);
      res.status(200).json({
        success: true,
        results: results
      });
    }

  } catch (error) {
    logger.error('Bulk email send error', error);
    res.status(500).json({
      error: 'Failed to send bulk emails',
      message: error.message
    });
  }
});

// Schedule email endpoint
router.post('/schedule', [...validateEmailRequest, body('scheduledAt').isISO8601().withMessage('Invalid scheduled date')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { scheduledAt, ...emailRequest } = req.body;
    const result = await emailService.scheduleEmail(emailRequest, new Date(scheduledAt));

    res.status(200).json({
      success: true,
      scheduleId: result.id
    });

  } catch (error) {
    logger.error('Email schedule error', error);
    res.status(500).json({
      error: 'Failed to schedule email',
      message: error.message
    });
  }
});

// Get email templates
router.get('/templates', async (req, res) => {
  try {
    const { form_type } = req.query;
    const templates = await emailService.getTemplates(form_type);

    res.status(200).json({
      success: true,
      templates: templates
    });

  } catch (error) {
    logger.error('Get templates error', error);
    res.status(500).json({
      error: 'Failed to get templates',
      message: error.message
    });
  }
});

// Create email template
router.post('/templates', validateTemplateRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const template = await emailService.createTemplate(req.body);

    res.status(201).json({
      success: true,
      template: template
    });

  } catch (error) {
    logger.error('Create template error', error);
    res.status(500).json({
      error: 'Failed to create template',
      message: error.message
    });
  }
});

// Update email template
router.put('/templates/:id', validateTemplateRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const template = await emailService.updateTemplate(id, req.body);

    res.status(200).json({
      success: true,
      template: template
    });

  } catch (error) {
    logger.error('Update template error', error);
    res.status(500).json({
      error: 'Failed to update template',
      message: error.message
    });
  }
});

// Delete email template
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await emailService.deleteTemplate(id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    logger.error('Delete template error', error);
    res.status(500).json({
      error: 'Failed to delete template',
      message: error.message
    });
  }
});

// Get notification history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 20, form_type, status } = req.query;
    const history = await emailService.getNotificationHistory({
      page: parseInt(page),
      limit: parseInt(limit),
      form_type,
      status
    });

    res.status(200).json({
      success: true,
      ...history
    });

  } catch (error) {
    logger.error('Get history error', error);
    res.status(500).json({
      error: 'Failed to get notification history',
      message: error.message
    });
  }
});

// Get email analytics
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate, form_type } = req.query;
    const analytics = await emailService.getEmailAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      form_type
    });

    res.status(200).json({
      success: true,
      analytics: analytics
    });

  } catch (error) {
    logger.error('Get analytics error', error);
    res.status(500).json({
      error: 'Failed to get email analytics',
      message: error.message
    });
  }
});

// Test SMTP connection
router.post('/test-connection', async (req, res) => {
  try {
    const result = await emailService.testConnection();

    res.status(200).json({
      success: true,
      message: 'SMTP connection successful',
      details: result
    });

  } catch (error) {
    logger.error('SMTP test error', error);
    res.status(500).json({
      error: 'SMTP connection failed',
      message: error.message
    });
  }
});

// Send test email
router.post('/test-send', [body('to').isEmail().withMessage('Valid email address required')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { to } = req.body;
    const result = await emailService.sendTestEmail(to);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    logger.error('Test email error', error);
    res.status(500).json({
      error: 'Failed to send test email',
      message: error.message
    });
  }
});

module.exports = router;
