import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Mail, Server, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  rateLimitPerMinute: number;
  enableLogging: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  autoCleanupDays: number;
}

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Homa Suite',
    maxRetries: 3,
    retryDelay: 5000,
    batchSize: 10,
    rateLimitPerMinute: 60,
    enableLogging: true,
    logLevel: 'info',
    autoCleanupDays: 90
  });

  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    // In real implementation, load from API
    // For now, using mock data
  }, []);

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In real implementation, save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      // In real implementation, test SMTP connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('SMTP connection test successful');
    } catch (error) {
      toast.error('SMTP connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      // In real implementation, send test email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Test email sent successfully');
    } catch (error) {
      toast.error('Failed to send test email');
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off all email notifications system-wide
              </p>
            </div>
            <Switch
              id="emailEnabled"
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => handleSettingChange('emailEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email *</Label>
              <Input
                id="fromEmail"
                type="email"
                value={settings.fromEmail}
                onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                placeholder="notifications@company.com"
                disabled={!settings.emailEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={settings.fromName}
                onChange={(e) => handleSettingChange('fromName', e.target.value)}
                placeholder="Homa Suite"
                disabled={!settings.emailEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host *</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                disabled={!settings.emailEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port *</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                placeholder="587"
                disabled={!settings.emailEnabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input
                id="smtpUsername"
                value={settings.smtpUsername}
                onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                placeholder="your-email@gmail.com"
                disabled={!settings.emailEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                placeholder="••••••••"
                disabled={!settings.emailEnabled}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!settings.emailEnabled || testingConnection}
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={!settings.emailEnabled}
            >
              Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance & Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxRetries">Max Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                min="0"
                max="10"
                value={settings.maxRetries}
                onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                disabled={!settings.emailEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Number of retry attempts for failed emails
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
              <Input
                id="retryDelay"
                type="number"
                min="1000"
                value={settings.retryDelay}
                onChange={(e) => handleSettingChange('retryDelay', parseInt(e.target.value))}
                disabled={!settings.emailEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Delay between retry attempts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                min="1"
                max="100"
                value={settings.batchSize}
                onChange={(e) => handleSettingChange('batchSize', parseInt(e.target.value))}
                disabled={!settings.emailEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Number of emails to send in each batch
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimitPerMinute">Rate Limit (per minute)</Label>
              <Input
                id="rateLimitPerMinute"
                type="number"
                min="1"
                value={settings.rateLimitPerMinute}
                onChange={(e) => handleSettingChange('rateLimitPerMinute', parseInt(e.target.value))}
                disabled={!settings.emailEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Maximum emails to send per minute
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logging & Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logging & Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableLogging">Enable Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log notification activities for debugging and monitoring
              </p>
            </div>
            <Switch
              id="enableLogging"
              checked={settings.enableLogging}
              onCheckedChange={(checked) => handleSettingChange('enableLogging', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select 
                value={settings.logLevel} 
                onValueChange={(value) => handleSettingChange('logLevel', value)}
                disabled={!settings.enableLogging}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="autoCleanupDays">Auto Cleanup (days)</Label>
              <Input
                id="autoCleanupDays"
                type="number"
                min="1"
                value={settings.autoCleanupDays}
                onChange={(e) => handleSettingChange('autoCleanupDays', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Automatically delete notification history older than this many days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-muted-foreground">Delivery Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-muted-foreground">Emails Sent (30d)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-muted-foreground">Failed (30d)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
