# Homa Suite Email Backend

A robust Node.js backend service for handling email notifications with GoDaddy SMTP integration, queue management, and analytics.

## Features

- **GoDaddy SMTP Integration**: Reliable email delivery using GoDaddy's SMTP servers
- **Email Queue System**: Redis-based queue for handling bulk emails and rate limiting
- **Template Management**: Dynamic email templates with variable substitution using Handlebars
- **Email Analytics**: Track delivery status, open rates, and click-through rates
- **Email Scheduling**: Schedule emails for future delivery
- **Error Handling**: Comprehensive retry mechanisms and error logging
- **Security**: Rate limiting, input validation, and CORS protection

## Prerequisites

- Node.js 18.0.0 or higher
- Redis server (for queue functionality)
- Supabase account and database
- GoDaddy email account with SMTP credentials

## Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment configuration:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# SMTP Configuration (GoDaddy)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_email_password

# Email Settings
EMAIL_SENDER_NAME=Homa Suite
EMAIL_SENDER_ADDRESS=noreply@yourdomain.com
EMAIL_MAX_RETRIES=3
EMAIL_BATCH_SIZE=10
EMAIL_BATCH_DELAY=1000

# Email Features
EMAIL_TRACKING_ENABLED=true
EMAIL_ANALYTICS_ENABLED=true
USE_EMAIL_QUEUE=true

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Email Operations

#### Send Single Email

```http
POST /api/email/send
Content-Type: application/json

{
  "to": ["recipient@example.com"],
  "subject": "Test Email",
  "body": "<h1>Hello World</h1>",
  "formType": "test"
}
```

#### Send Bulk Emails

```http
POST /api/email/send-bulk
Content-Type: application/json

{
  "emails": [
    {
      "to": ["recipient1@example.com"],
      "subject": "Bulk Email 1",
      "body": "<p>Content 1</p>",
      "formType": "bulk"
    }
  ]
}
```

#### Schedule Email

```http
POST /api/email/schedule
Content-Type: application/json

{
  "to": ["recipient@example.com"],
  "subject": "Scheduled Email",
  "body": "<p>This email was scheduled</p>",
  "formType": "scheduled",
  "scheduledAt": "2024-12-25T10:00:00Z"
}
```

### Template Management

#### Get Templates

```http
GET /api/email/templates?form_type=invoice
```

#### Create Template

```http
POST /api/email/templates
Content-Type: application/json

{
  "name": "Invoice Template",
  "form_type": "invoice",
  "subject_template": "Invoice #{{invoice_number}} from {{company_name}}",
  "body_template": "<h1>Invoice #{{invoice_number}}</h1><p>Amount: {{amount}}</p>",
  "is_active": true
}
```

#### Update Template

```http
PUT /api/email/templates/:id
Content-Type: application/json

{
  "name": "Updated Invoice Template",
  "subject_template": "Updated: Invoice #{{invoice_number}}"
}
```

#### Delete Template

```http
DELETE /api/email/templates/:id
```

### Analytics and History

#### Get Notification History

```http
GET /api/email/history?page=1&limit=20&form_type=invoice&status=sent
```

#### Get Email Analytics

```http
GET /api/email/analytics?startDate=2024-01-01&endDate=2024-12-31&form_type=invoice
```

### Testing

#### Test SMTP Connection

```http
POST /api/email/test-connection
```

#### Send Test Email

```http
POST /api/email/test-send
Content-Type: application/json

{
  "to": "test@example.com"
}
```

## Email Templates

Templates use Handlebars syntax for variable substitution:

```html
<html>
  <body>
    <h1>Hello {{name}}!</h1>
    <p>Your order #{{order_number}} has been {{status}}.</p>
    <p>Total amount: ${{amount}}</p>
  </body>
</html>
```

Variables are automatically extracted from templates and stored in the database.

## Queue Management

The email queue provides:

- **Automatic retries** with exponential backoff
- **Rate limiting** to prevent SMTP server overload
- **Job prioritization** (high, normal, low)
- **Progress tracking** for bulk operations
- **Dead letter queue** for failed jobs

### Queue Statistics

Monitor queue health:

```javascript
const emailQueue = new EmailQueue();
const stats = await emailQueue.getQueueStats();
console.log(stats);
// {
//   waiting: 5,
//   active: 2,
//   completed: 100,
//   failed: 3,
//   delayed: 10
// }
```

## Email Tracking

When `EMAIL_TRACKING_ENABLED=true`, emails include:

- **Open tracking**: 1x1 pixel image
- **Click tracking**: Link redirection through tracking URLs
- **Unsubscribe links**: Automatic GDPR-compliant unsubscribe

Tracking endpoints:

- `GET /api/email/track/open/:emailId` - Track email opens
- `GET /api/email/track/click/:emailId/:linkId?url=...` - Track link clicks
- `GET /unsubscribe?token=...` - Handle unsubscribe requests

## Error Handling

The service includes comprehensive error handling:

- **Retry mechanisms** with exponential backoff
- **Fallback SMTP servers** (if configured)
- **Detailed error logging** with Winston
- **Graceful degradation** when Redis is unavailable

## Security Features

- **Rate limiting**: 100 requests per 15 minutes per IP
- **Input validation**: Express-validator for all endpoints
- **CORS protection**: Configurable allowed origins
- **Helmet.js**: Security headers
- **Environment isolation**: Separate configs for dev/prod

## Monitoring and Logging

Logs are written to:

- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All log levels
- Console output in development

Log rotation is configured with a 5MB limit and 5 file retention.

## Database Schema

The service requires these Supabase tables:

- `notification_history` - Email delivery records
- `email_templates` - Template definitions
- `notification_groups` - Recipient groups
- `notification_group_members` - Group memberships
- `email_delivery_logs` - Detailed delivery logs
- `email_analytics` - Analytics data
- `email_schedules` - Scheduled email jobs

Run the migration file to create these tables:

```sql
-- See supabase/migrations/20250906_create_notification_system.sql
```

## Performance Considerations

- **Connection pooling**: SMTP connections are pooled and reused
- **Batch processing**: Bulk emails are processed in configurable batches
- **Rate limiting**: Configurable delays between email sends
- **Queue persistence**: Jobs survive server restarts
- **Memory management**: Completed jobs are automatically cleaned up

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**

   - Verify GoDaddy credentials
   - Check if 2FA is enabled (may need app password)
   - Ensure SMTP is enabled in GoDaddy settings

2. **Redis Connection Failed**

   - Check Redis server is running
   - Verify REDIS_URL configuration
   - Service falls back to direct processing if Redis unavailable

3. **Template Rendering Errors**

   - Verify Handlebars syntax
   - Check variable names match template
   - Ensure all required variables are provided

4. **Rate Limiting Issues**
   - Adjust EMAIL_BATCH_SIZE and EMAIL_BATCH_DELAY
   - Monitor SMTP server limits
   - Consider using multiple SMTP accounts

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

MIT License - see LICENSE file for details.
