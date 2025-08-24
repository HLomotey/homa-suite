import React from "react";
import { ActivityLogDashboard } from "@/components/activity-log/ActivityLogDashboard";

const ActivityLogPage: React.FC = () => {
  return (
    <div className="space-y- p-6">
      <ActivityLogDashboard />
    </div>
  );
};

export default ActivityLogPage;
