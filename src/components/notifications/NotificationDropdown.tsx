import React, { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useUnreadNotificationCount
} from '@/hooks/notifications';
import { NotificationType } from '@/integration/supabase/types/notifications';

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: string;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
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
  onClick,
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

  const content = (
    <div 
      className={cn(
        "flex flex-col gap-1 p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer",
        !isRead && "bg-muted/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {!isRead && (
              <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />
            )}
          </div>
          {createdAt && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(createdAt), 'MMM d, h:mm a')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={handleDelete}
            title="Delete notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete notification</span>
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
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
  <div className="p-3">
    <div className="flex items-start justify-between mb-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-3 w-[80px]" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
    <Skeleton className="h-10 w-full mt-1" />
  </div>
);

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications({ limit: 10 });
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
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

  const getNotificationLink = (type: NotificationType, entityId: string) => {
    if (type.startsWith('maintenance_')) {
      return `/maintenance/requests/${entityId}`;
    }
    return '#';
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center text-[10px] px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isLoading && (
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          )}

          {!isLoading && notifications?.length === 0 && (
            <div className="py-6 text-center">
              <div className="flex justify-center mb-2">
                <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}

          {!isLoading &&
            notifications?.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <NotificationItem
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
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/notifications"
            className="flex justify-center text-sm text-muted-foreground hover:text-foreground py-2"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
