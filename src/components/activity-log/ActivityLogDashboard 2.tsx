import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ActivityLogTable } from './ActivityLogTable';
import { useActivityLogs, useActivitySummary } from '@/hooks/activity-log/useActivityLogs';
import { ActivityLogFilters } from '@/hooks/activity-log/api';
import { 
  Activity, 
  Users, 
  Database, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

export const ActivityLogDashboard: React.FC = () => {
  const [filters, setFilters] = useState<ActivityLogFilters>({
    limit: 50
  });
  
  const { logs, loading, error, refetch } = useActivityLogs(filters);
  const { tableSummary, userSummary, loading: summaryLoading } = useActivitySummary(7);

  const handleFilterChange = (key: keyof ActivityLogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({ limit: 50 });
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    key !== 'limit' && filters[key as keyof ActivityLogFilters]
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Log Dashboard</h1>
          <p className="text-white/60">Monitor all system activity and user actions</p>
        </div>
        <Button onClick={refetch} disabled={loading} className="bg-primary hover:bg-primary/80">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{logs.length}</div>
            <p className="text-xs text-white/60">Current view</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Users</CardTitle>
            <Users className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {summaryLoading ? '...' : userSummary.length}
            </div>
            <p className="text-xs text-white/60">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Tables Modified</CardTitle>
            <Database className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {summaryLoading ? '...' : tableSummary.length}
            </div>
            <p className="text-xs text-white/60">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Active Filters</CardTitle>
            <Filter className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeFiltersCount}</div>
            <p className="text-xs text-white/60">Applied filters</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Tables and Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Most Active Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="text-center text-white/60">Loading...</div>
            ) : tableSummary.length > 0 ? (
              <div className="space-y-2">
                {tableSummary.slice(0, 5).map((item) => (
                  <div key={item.table_name} className="flex items-center justify-between">
                    <span className="text-white/80 capitalize">
                      {item.table_name.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/60">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="text-center text-white/60">Loading...</div>
            ) : userSummary.length > 0 ? (
              <div className="space-y-2">
                {userSummary.slice(0, 5).map((item) => (
                  <div key={item.user_email} className="flex items-center justify-between">
                    <span className="text-white/80 truncate">
                      {item.user_email}
                    </span>
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/60">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </span>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Table Name</label>
              <Input
                placeholder="e.g. users, properties"
                value={filters.table_name || ''}
                onChange={(e) => handleFilterChange('table_name', e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Operation</label>
              <Select 
                value={filters.operation || 'all'} 
                onValueChange={(value) => handleFilterChange('operation', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="All operations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All operations</SelectItem>
                  <SelectItem value="INSERT">INSERT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Record ID</label>
              <Input
                placeholder="Record ID"
                value={filters.record_id || ''}
                onChange={(e) => handleFilterChange('record_id', e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Start Date</label>
              <Input
                type="datetime-local"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Limit</label>
              <Select 
                value={filters.limit?.toString() || '50'} 
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      {error ? (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-6">
            <div className="text-red-300">Error loading activity logs: {error}</div>
          </CardContent>
        </Card>
      ) : (
        <ActivityLogTable logs={logs} loading={loading} />
      )}
    </div>
  );
};
