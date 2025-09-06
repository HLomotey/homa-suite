import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, History, Settings, Users, FileText, Plus } from 'lucide-react';
import { NotificationHistory } from './NotificationHistory';
import { NotificationTemplates } from './NotificationTemplates';
import { NotificationGroups } from './NotificationGroups';
import { NotificationSettings } from './NotificationSettings';
import { EmailNotificationPanel } from '@/components/shared/EmailNotificationPanel';

const NotificationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [showNewNotification, setShowNewNotification] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Manage email notifications, templates, and recipient groups
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewNotification(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6 h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groups
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-6 overflow-hidden">
              <TabsContent value="history" className="h-full m-0">
                <NotificationHistory />
              </TabsContent>

              <TabsContent value="templates" className="h-full m-0">
                <NotificationTemplates />
              </TabsContent>

              <TabsContent value="groups" className="h-full m-0">
                <NotificationGroups />
              </TabsContent>

              <TabsContent value="settings" className="h-full m-0">
                <NotificationSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* New Notification Modal/Sheet */}
      {showNewNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Send New Notification</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewNotification(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <EmailNotificationPanel
                formType="manual"
                onSend={() => setShowNewNotification(false)}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationModule;
