import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Users, User, X, Send, Loader2 } from 'lucide-react';
import { useEmailNotification } from '@/hooks/notification/useEmailNotification';
import { EmailRecipient, EmailGroup, EmailNotificationConfig } from '@/types/notification';

interface EmailNotificationPanelProps {
  formType: string;
  formData?: any;
  onSend?: (config: EmailNotificationConfig) => void;
  className?: string;
}

export const EmailNotificationPanel: React.FC<EmailNotificationPanelProps> = ({
  formType,
  formData,
  onSend,
  className = ''
}) => {
  const { 
    loading, 
    recipients, 
    groups, 
    fetchRecipients, 
    fetchGroups, 
    sendNotification, 
    generateEmailContent 
  } = useEmailNotification();

  const [config, setConfig] = useState<EmailNotificationConfig>({
    enabled: false,
    recipients: [],
    groups: [],
    subject: '',
    message: '',
    includeFormData: true,
    sendOnSubmit: true,
    sendOnUpdate: false,
    sendOnDelete: false
  });

  const [selectedRecipients, setSelectedRecipients] = useState<EmailRecipient[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<EmailGroup[]>([]);
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (config.enabled) {
      fetchRecipients();
      fetchGroups();
    }
  }, [config.enabled]);

  useEffect(() => {
    // Auto-generate email content when form data changes
    if (formData && config.enabled) {
      const { subject, body } = generateEmailContent(formType, formData, customMessage);
      setConfig(prev => ({ ...prev, subject, message: body }));
    }
  }, [formData, formType, customMessage, config.enabled]);

  const handleToggleNotification = (enabled: boolean) => {
    setConfig(prev => ({ ...prev, enabled }));
  };

  const handleAddRecipient = (recipient: EmailRecipient) => {
    if (!selectedRecipients.find(r => r.id === recipient.id)) {
      const newRecipients = [...selectedRecipients, recipient];
      setSelectedRecipients(newRecipients);
      setConfig(prev => ({ ...prev, recipients: newRecipients }));
    }
  };

  const handleRemoveRecipient = (recipientId: string) => {
    const newRecipients = selectedRecipients.filter(r => r.id !== recipientId);
    setSelectedRecipients(newRecipients);
    setConfig(prev => ({ ...prev, recipients: newRecipients }));
  };

  const handleAddGroup = (group: EmailGroup) => {
    if (!selectedGroups.find(g => g.id === group.id)) {
      const newGroups = [...selectedGroups, group];
      setSelectedGroups(newGroups);
      setConfig(prev => ({ ...prev, groups: newGroups }));
    }
  };

  const handleRemoveGroup = (groupId: string) => {
    const newGroups = selectedGroups.filter(g => g.id !== groupId);
    setSelectedGroups(newGroups);
    setConfig(prev => ({ ...prev, groups: newGroups }));
  };

  const handleAddCustomRecipient = () => {
    if (customRecipientEmail && customRecipientEmail.includes('@')) {
      const customRecipient: EmailRecipient = {
        id: `custom-${Date.now()}`,
        name: customRecipientEmail.split('@')[0],
        email: customRecipientEmail
      };
      handleAddRecipient(customRecipient);
      setCustomRecipientEmail('');
    }
  };

  const getAllRecipientEmails = (): string[] => {
    const recipientEmails = selectedRecipients.map(r => r.email);
    const groupEmails = selectedGroups.flatMap(g => g.recipients.map(r => r.email));
    return [...new Set([...recipientEmails, ...groupEmails])];
  };

  const handleSendNotification = async () => {
    const allEmails = getAllRecipientEmails();
    if (allEmails.length === 0) return;

    const success = await sendNotification({
      to: allEmails,
      subject: config.subject,
      body: config.message,
      formType,
      formData,
      variables: { customMessage }
    });

    if (success && onSend) {
      onSend(config);
    }
  };

  if (!config.enabled) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email Notifications</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleNotification(true)}
            >
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Notifications
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleNotification(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notification Triggers */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">SEND NOTIFICATIONS ON</Label>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendOnSubmit"
                checked={config.sendOnSubmit}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, sendOnSubmit: !!checked }))
                }
              />
              <Label htmlFor="sendOnSubmit" className="text-sm">Form Submit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendOnUpdate"
                checked={config.sendOnUpdate}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, sendOnUpdate: !!checked }))
                }
              />
              <Label htmlFor="sendOnUpdate" className="text-sm">Update</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendOnDelete"
                checked={config.sendOnDelete}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, sendOnDelete: !!checked }))
                }
              />
              <Label htmlFor="sendOnDelete" className="text-sm">Delete</Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recipients Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">RECIPIENTS</Label>
          
          {/* Individual Recipients */}
          <div className="space-y-2">
            <Label className="text-sm">Individual Recipients</Label>
            <Select onValueChange={(value) => {
              const recipient = recipients.find(r => r.id === value);
              if (recipient) handleAddRecipient(recipient);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipient..." />
              </SelectTrigger>
              <SelectContent>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{recipient.name}</span>
                      <span className="text-xs text-muted-foreground">({recipient.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Groups */}
          <div className="space-y-2">
            <Label className="text-sm">Groups</Label>
            <Select onValueChange={(value) => {
              const group = groups.find(g => g.id === value);
              if (group) handleAddGroup(group);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{group.name}</span>
                      <span className="text-xs text-muted-foreground">({group.recipients.length} members)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Email */}
          <div className="space-y-2">
            <Label className="text-sm">Custom Email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={customRecipientEmail}
                onChange={(e) => setCustomRecipientEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRecipient()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCustomRecipient}
                disabled={!customRecipientEmail.includes('@')}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Selected Recipients Display */}
          {(selectedRecipients.length > 0 || selectedGroups.length > 0) && (
            <div className="space-y-2">
              <Label className="text-sm">Selected ({getAllRecipientEmails().length} total)</Label>
              <div className="flex flex-wrap gap-1">
                {selectedRecipients.map(recipient => (
                  <Badge key={recipient.id} variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {recipient.name}
                    <button
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      className="ml-1 hover:text-destructive"
                      title={`Remove ${recipient.name}`}
                      aria-label={`Remove ${recipient.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedGroups.map(group => (
                  <Badge key={group.id} variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {group.name}
                    <button
                      onClick={() => handleRemoveGroup(group.id)}
                      className="ml-1 hover:text-destructive"
                      title={`Remove ${group.name} group`}
                      aria-label={`Remove ${group.name} group`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Email Content */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">EMAIL CONTENT</Label>
          
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm">Subject</Label>
            <Input
              id="subject"
              value={config.subject}
              onChange={(e) => setConfig(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage" className="text-sm">Custom Message</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a custom message (optional)..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeFormData"
              checked={config.includeFormData}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, includeFormData: !!checked }))
              }
            />
            <Label htmlFor="includeFormData" className="text-sm">Include form data in email</Label>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendNotification}
          disabled={loading || getAllRecipientEmails().length === 0}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send Notification ({getAllRecipientEmails().length} recipients)
        </Button>
      </CardContent>
    </Card>
  );
};
