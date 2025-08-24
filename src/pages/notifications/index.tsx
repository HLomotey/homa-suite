import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bell, Check, Trash2, Filter, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useDeleteNotification
} from '@/hooks/notifications';
import { NotificationType } from '@/integration/supabase/types/notifications';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: string;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  linkTo?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  type,
  isRead,
  createdAt,
  onMarkAsRead,
  onDelete,
  linkTo
}) => {
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'maintenance_update':
        return 'Update';
      case 'maintenance_assigned':
        return 'Assigned';
      case 'maintenance_scheduled':
        return 'Scheduled';
      case 'maintenance_completed':
        return 'Completed';
      case 'maintenance_canceled':
        return 'Canceled';
      default:
        return 'Notification';
    }
  };

  const getNotificationTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'maintenance_update':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance_assigned':
        return 'bg-purple-100 text-purple-800';
      case 'maintenance_scheduled':
        return 'bg-amber-100 text-amber-800';
      case 'maintenance_completed':
        return 'bg-green-100 text-green-800';
      case 'maintenance_canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const content = (
    <div 
      className={cn(
        "flex flex-col gap-2 p-4 hover:bg-muted/50 rounded-md transition-colors",
        !isRead && "bg-muted/30 border-l-4 border-primary"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-lg">{title}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded", getNotificationTypeColor(type))}>
              {getNotificationTypeLabel(type)}
            </span>
            {!isRead && (
              <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
            )}
          </div>
          {createdAt && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(createdAt), 'MMMM d, yyyy • h:mm a')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isRead && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-destructive border-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            title="Delete notification"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block no-underline text-foreground">
        {content}
      </Link>
    );
  }

  return content;
};

const NotificationSkeleton = () => (
  <div className="p-4 border-b">
    <div className="flex items-start justify-between mb-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-16 w-full mt-2" />
  </div>
);

const NotificationsPage = () => {
  const [filter, setFilter] = useState<{
    isRead?: boolean;
    types?: NotificationType[];
  }>({});
  
  const { data: notifications, isLoading, refetch } = useNotifications(filter);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getNotificationLink = (type: NotificationType, entityId: string) => {
    if (type.startsWith('maintenance_')) {
      return `/maintenance/requests/${entityId}`;
    }
    return '#';
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  
  const filterByTab = (tab: string) => {
    switch (tab) {
      case 'all':
        setFilter({});
        break;
      case 'unread':
        setFilter({ isRead: false });
        break;
      case 'maintenance':
        setFilter({ 
          types: [
            'maintenance_update', 
            'maintenance_assigned', 
            'maintenance_scheduled', 
            'maintenance_completed', 
            'maintenance_canceled'
          ] 
        });
        break;
      default:
        setFilter({});
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Notifications</CardTitle>
            <CardDescription>
              View and manage your notifications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all as read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setFilter(f => ({ ...f, types: ['maintenance_update'] }))}>
                    <Checkbox id="maintenance_update" className="mr-2" />
                    <label htmlFor="maintenance_update">Maintenance Updates</label>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilter(f => ({ ...f, types: ['maintenance_assigned'] }))}>
                    <Checkbox id="maintenance_assigned" className="mr-2" />
                    <label htmlFor="maintenance_assigned">Maintenance Assigned</label>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilter(f => ({ ...f, types: ['maintenance_scheduled'] }))}>
                    <Checkbox id="maintenance_scheduled" className="mr-2" />
                    <label htmlFor="maintenance_scheduled">Maintenance Scheduled</label>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilter(f => ({ ...f, types: ['maintenance_completed'] }))}>
                    <Checkbox id="maintenance_completed" className="mr-2" />
                    <label htmlFor="maintenance_completed">Maintenance Completed</label>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setFilter({})}>
                  Clear filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={filterByTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {renderNotificationList()}
            </TabsContent>
            <TabsContent value="unread" className="mt-0">
              {renderNotificationList()}
            </TabsContent>
            <TabsContent value="maintenance" className="mt-0">
              {renderNotificationList()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function renderNotificationList() {
    if (isLoading) {
      return (
        <div className="divide-y">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="flex justify-center mb-4">
            <Bell className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-medium mb-1">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any notifications at the moment
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            isRead={notification.isRead}
            createdAt={notification.createdAt}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            linkTo={getNotificationLink(notification.type, notification.relatedEntityId)}
          />
        ))}
      </div>
    );
  }
};

export default NotificationsPage;
