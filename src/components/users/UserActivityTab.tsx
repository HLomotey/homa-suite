import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { FrontendUser } from '@/integration/supabase/types';

interface UserActivityTabProps {
  user: FrontendUser;
}

export const UserActivityTab: React.FC<UserActivityTabProps> = ({ user }) => {
  // Mock activity data - in a real app, this would come from an API
  const activities = [
    {
      id: 1,
      type: 'login',
      description: 'User logged in',
      timestamp: new Date().toISOString(),
      status: 'success'
    },
    {
      id: 2,
      type: 'profile_update',
      description: 'Profile information updated',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'info'
    },
    {
      id: 3,
      type: 'permission_change',
      description: 'Permissions modified by admin',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      status: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/20 border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-sm text-white/60">Created</p>
                <p className="text-white font-medium">
                  {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-sm text-white/60">Last Active</p>
                <p className="text-white font-medium">
                  {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-sm text-white/60">Status</p>
                <Badge className={getStatusColor(user.status || 'pending')}>
                  {user.status || 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 border-white/5">
        <CardContent className="p-4">
          <h3 className="text-white font-medium mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-black/10">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm">{activity.description}</p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
