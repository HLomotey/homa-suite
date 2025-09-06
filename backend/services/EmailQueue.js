const Queue = require('bull');
const redis = require('redis');
const { logger } = require('../utils/logger');
const EmailService = require('./EmailService');

class EmailQueue {
  constructor() {
    this.emailService = new EmailService();
    this.redisClient = null;
    this.emailQueue = null;
    this.initializeQueue();
  }

  async initializeQueue() {
    try {
      // Initialize Redis connection
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redisClient = redis.createClient({ url: redisUrl });
      
      await this.redisClient.connect();
      logger.info('Redis connection established');

      // Initialize Bull queue
      this.emailQueue = new Queue('email processing', redisUrl, {
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 50,      // Keep last 50 failed jobs
          attempts: 3,           // Retry failed jobs 3 times
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      // Process jobs
      this.emailQueue.process('send-email', this.processSendEmail.bind(this));
      this.emailQueue.process('send-bulk-email', this.processBulkEmail.bind(this));
      this.emailQueue.process('send-scheduled-email', this.processScheduledEmail.bind(this));

      // Event listeners
      this.emailQueue.on('completed', (job) => {
        logger.info(`Email job completed: ${job.id}`, { jobData: job.data });
      });

      this.emailQueue.on('failed', (job, err) => {
        logger.error(`Email job failed: ${job.id}`, { error: err.message, jobData: job.data });
      });

      this.emailQueue.on('stalled', (job) => {
        logger.warn(`Email job stalled: ${job.id}`, { jobData: job.data });
      });

      logger.info('Email queue initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email queue:', error);
      // Fallback to direct processing if Redis is not available
      this.useDirectProcessing = true;
    }
  }

  async addEmailJob(emailRequest, options = {}) {
    try {
      if (this.useDirectProcessing || !this.emailQueue) {
        // Direct processing fallback
        return await this.emailService.sendEmail(emailRequest);
      }

      const job = await this.emailQueue.add('send-email', emailRequest, {
        priority: this.getPriority(emailRequest.priority),
        delay: options.delay || 0,
        ...options
      });

      logger.info(`Email job queued: ${job.id}`, { emailRequest });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue email job:', error);
      throw error;
    }
  }

  async addBulkEmailJob(emailRequests, options = {}) {
    try {
      if (this.useDirectProcessing || !this.emailQueue) {
        // Direct processing fallback
        return await this.emailService.sendBulkEmails(emailRequests);
      }

      const job = await this.emailQueue.add('send-bulk-email', { emails: emailRequests }, {
        priority: 5, // Medium priority for bulk emails
        ...options
      });

      logger.info(`Bulk email job queued: ${job.id}`, { count: emailRequests.length });
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Failed to queue bulk email job:', error);
      throw error;
    }
  }

  async addScheduledEmailJob(emailRequest, scheduledAt, options = {}) {
    try {
      if (this.useDirectProcessing || !this.emailQueue) {
        // For direct processing, we'll store in database and process later
        return await this.emailService.scheduleEmail(emailRequest, scheduledAt);
      }

      const delay = new Date(scheduledAt).getTime() - Date.now();
      
      if (delay <= 0) {
        // Send immediately if scheduled time has passed
        return await this.addEmailJob(emailRequest, options);
      }

      const job = await this.emailQueue.add('send-scheduled-email', emailRequest, {
        delay,
        priority: this.getPriority(emailRequest.priority),
        ...options
      });

      logger.info(`Scheduled email job queued: ${job.id}`, { scheduledAt, emailRequest });
      return { success: true, jobId: job.id, scheduledAt };
    } catch (error) {
      logger.error('Failed to queue scheduled email job:', error);
      throw error;
    }
  }

  async processSendEmail(job) {
    const { data } = job;
    logger.info(`Processing email job: ${job.id}`);

    try {
      const result = await this.emailService.sendEmail(data);
      
      // Update job progress
      job.progress(100);
      
      return result;
    } catch (error) {
      logger.error(`Email job processing failed: ${job.id}`, error);
      throw error;
    }
  }

  async processBulkEmail(job) {
    const { data } = job;
    logger.info(`Processing bulk email job: ${job.id}`, { count: data.emails.length });

    try {
      const results = [];
      const totalEmails = data.emails.length;

      for (let i = 0; i < totalEmails; i++) {
        const email = data.emails[i];
        
        try {
          const result = await this.emailService.sendEmail(email);
          results.push(result);
          
          // Update progress
          const progress = Math.round(((i + 1) / totalEmails) * 100);
          job.progress(progress);
          
          // Rate limiting between emails
          if (i < totalEmails - 1) {
            await this.delay(parseInt(process.env.EMAIL_BATCH_DELAY) || 1000);
          }
        } catch (error) {
          logger.error(`Failed to send email in bulk job: ${job.id}`, error);
          results.push({
            success: false,
            error: error.message,
            deliveryTime: 0,
            attempt: 1,
            provider: 'godaddy'
          });
        }
      }

      return results;
    } catch (error) {
      logger.error(`Bulk email job processing failed: ${job.id}`, error);
      throw error;
    }
  }

  async processScheduledEmail(job) {
    const { data } = job;
    logger.info(`Processing scheduled email job: ${job.id}`);

    try {
      const result = await this.emailService.sendEmail(data);
      
      // Update job progress
      job.progress(100);
      
      return result;
    } catch (error) {
      logger.error(`Scheduled email job processing failed: ${job.id}`, error);
      throw error;
    }
  }

  getPriority(priority) {
    switch (priority) {
      case 'high': return 10;
      case 'normal': return 5;
      case 'low': return 1;
      default: return 5;
    }
  }

  async getQueueStats() {
    try {
      if (!this.emailQueue) {
        return {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0
        };
      }

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.emailQueue.getActive(),
        this.emailQueue.getCompleted(),
        this.emailQueue.getFailed(),
        this.emailQueue.getDelayed()
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0
      };
    }
  }

  async getJobStatus(jobId) {
    try {
      if (!this.emailQueue) {
        return { status: 'unknown' };
      }

      const job = await this.emailQueue.getJob(jobId);
      
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      
      return {
        status: state,
        progress: job.progress(),
        data: job.data,
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : null,
        finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
        failedReason: job.failedReason
      };
    } catch (error) {
      logger.error('Failed to get job status:', error);
      return { status: 'error', error: error.message };
    }
  }

  async pauseQueue() {
    try {
      if (this.emailQueue) {
        await this.emailQueue.pause();
        logger.info('Email queue paused');
      }
    } catch (error) {
      logger.error('Failed to pause queue:', error);
    }
  }

  async resumeQueue() {
    try {
      if (this.emailQueue) {
        await this.emailQueue.resume();
        logger.info('Email queue resumed');
      }
    } catch (error) {
      logger.error('Failed to resume queue:', error);
    }
  }

  async cleanQueue(grace = 5000) {
    try {
      if (this.emailQueue) {
        await this.emailQueue.clean(grace, 'completed');
        await this.emailQueue.clean(grace, 'failed');
        logger.info('Email queue cleaned');
      }
    } catch (error) {
      logger.error('Failed to clean queue:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    try {
      if (this.emailQueue) {
        await this.emailQueue.close();
      }
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      logger.info('Email queue closed');
    } catch (error) {
      logger.error('Failed to close email queue:', error);
    }
  }
}

module.exports = EmailQueue;
