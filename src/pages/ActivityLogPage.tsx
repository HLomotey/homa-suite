import React from 'react';
import { ActivityLogDashboard } from '@/components/activity-log/ActivityLogDashboard';

const ActivityLogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <ActivityLogDashboard />
    </div>
  );
};

export default ActivityLogPage;
