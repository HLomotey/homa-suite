import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Eye, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationRecord {
  id: string;
  form_type: string;
  recipients: string[];
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string | null;
  created_at: string;
  error_message?: string;
}

export const NotificationHistory: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockData: NotificationRecord[] = [
      {
        id: '1',
        form_type: 'bulk-projection',
        recipients: ['admin@company.com', 'finance@company.com'],
        subject: 'Bulk Projections: 5 projections created',
        body: '5 new projections have been created...',
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        form_type: 'projection',
        recipients: ['manager@company.com'],
        subject: 'New Projection: Q4 Revenue Forecast',
        body: 'A new projection has been created...',
        status: 'sent',
        sent_at: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        form_type: 'manual',
        recipients: ['team@company.com'],
        subject: 'System Maintenance Notice',
        body: 'Scheduled maintenance will occur...',
        status: 'failed',
        sent_at: null,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        error_message: 'SMTP server connection failed'
      }
    ];
    
    setTimeout(() => {
      setNotifications(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.recipients.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesFormType = formTypeFilter === 'all' || notification.form_type === formTypeFilter;
    
    return matchesSearch && matchesStatus && matchesFormType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormTypeLabel = (formType: string) => {
    switch (formType) {
      case 'bulk-projection':
        return 'Bulk Projections';
      case 'projection':
        return 'Projection';
      case 'manual':
        return 'Manual';
      default:
        return formType;
    }
  };

  const handleViewNotification = (notification: NotificationRecord) => {
    setSelectedNotification(notification);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleRefresh = () => {
    setLoading(true);
    // In real implementation, this would refetch from the API
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Form Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="projection">Projection</SelectItem>
                <SelectItem value="bulk-projection">Bulk Projection</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      {notification.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFormTypeLabel(notification.form_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {notification.recipients.slice(0, 2).map((recipient, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {recipient}
                          </Badge>
                        ))}
                        {notification.recipients.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{notification.recipients.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(notification.status)}
                    </TableCell>
                    <TableCell>
                      {notification.sent_at 
                        ? format(new Date(notification.sent_at), 'MMM dd, yyyy HH:mm')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewNotification(notification)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notification Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotification(null)}
              >
                ×
              </Button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="mt-1">{selectedNotification.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Recipients</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedNotification.recipients.map((recipient, index) => (
                    <Badge key={index} variant="secondary">
                      {recipient}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(selectedNotification.status)}
                </div>
              </div>
              {selectedNotification.error_message && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Error Message</label>
                  <p className="mt-1 text-red-600">{selectedNotification.error_message}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message Body</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{selectedNotification.body}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
