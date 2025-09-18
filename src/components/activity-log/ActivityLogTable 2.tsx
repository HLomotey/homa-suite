import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLog } from '@/hooks/activity-log/api';
import { cn } from '@/lib/utils';

interface ActivityLogTableProps {
  logs: ActivityLog[];
  loading?: boolean;
  showUser?: boolean;
  showTable?: boolean;
  className?: string;
}

const getOperationBadge = (operation: string) => {
  const variants = {
    INSERT: "bg-green-500/20 text-green-300 border-green-500/30",
    UPDATE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    DELETE: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  
  return (
    <Badge className={variants[operation as keyof typeof variants] || "bg-gray-500/20 text-gray-300"}>
      {operation}
    </Badge>
  );
};

const formatTableName = (tableName: string) => {
  return tableName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const truncateData = (data: any, maxLength = 100) => {
  if (!data) return 'N/A';
  
  const jsonString = JSON.stringify(data, null, 2);
  if (jsonString.length <= maxLength) return jsonString;
  
  return jsonString.substring(0, maxLength) + '...';
};

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  logs,
  loading = false,
  showUser = true,
  showTable = true,
  className
}) => {
  if (loading) {
    return (
      <Card className={cn("bg-white/5 border-white/10", className)}>
        <CardContent className="p-6">
          <div className="text-center text-white/60">Loading activity logs...</div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className={cn("bg-white/5 border-white/10", className)}>
        <CardContent className="p-6">
          <div className="text-center text-white/60">No activity logs found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white/5 border-white/10", className)}>
      <CardHeader>
        <CardTitle className="text-white">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/80">Timestamp</TableHead>
                {showUser && <TableHead className="text-white/80">User</TableHead>}
                {showTable && <TableHead className="text-white/80">Table</TableHead>}
                <TableHead className="text-white/80">Operation</TableHead>
                <TableHead className="text-white/80">Record ID</TableHead>
                <TableHead className="text-white/80">Changes</TableHead>
                <TableHead className="text-white/80">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white/80 font-mono text-sm">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                  </TableCell>
                  
                  {showUser && (
                    <TableCell className="text-white/80">
                      {log.user_email || 'System'}
                    </TableCell>
                  )}
                  
                  {showTable && (
                    <TableCell className="text-white/80">
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {formatTableName(log.table_name)}
                      </Badge>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    {getOperationBadge(log.operation)}
                  </TableCell>
                  
                  <TableCell className="text-white/80 font-mono text-sm">
                    {log.record_id ? (
                      <span className="bg-gray-500/20 px-2 py-1 rounded text-xs">
                        {log.record_id.length > 8 ? `${log.record_id.substring(0, 8)}...` : log.record_id}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  
                  <TableCell className="text-white/80 max-w-xs">
                    {log.operation === 'UPDATE' && log.changed_fields && log.changed_fields.length > 0 ? (
                      <div className="space-y-1">
                        <div className="text-xs text-white/60">
                          Changed: {log.changed_fields.join(', ')}
                        </div>
                        {log.old_data && log.new_data && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-300 hover:text-blue-200">
                              View details
                            </summary>
                            <div className="mt-2 p-2 bg-black/20 rounded border">
                              <div className="mb-2">
                                <strong className="text-red-300">Old:</strong>
                                <pre className="text-xs text-white/70 mt-1 overflow-x-auto">
                                  {truncateData(log.old_data)}
                                </pre>
                              </div>
                              <div>
                                <strong className="text-green-300">New:</strong>
                                <pre className="text-xs text-white/70 mt-1 overflow-x-auto">
                                  {truncateData(log.new_data)}
                                </pre>
                              </div>
                            </div>
                          </details>
                        )}
                      </div>
                    ) : log.operation === 'INSERT' && log.new_data ? (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-green-300 hover:text-green-200">
                          View created data
                        </summary>
                        <div className="mt-2 p-2 bg-black/20 rounded border">
                          <pre className="text-xs text-white/70 overflow-x-auto">
                            {truncateData(log.new_data)}
                          </pre>
                        </div>
                      </details>
                    ) : log.operation === 'DELETE' && log.old_data ? (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-red-300 hover:text-red-200">
                          View deleted data
                        </summary>
                        <div className="mt-2 p-2 bg-black/20 rounded border">
                          <pre className="text-xs text-white/70 overflow-x-auto">
                            {truncateData(log.old_data)}
                          </pre>
                        </div>
                      </details>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  
                  <TableCell className="text-white/80 font-mono text-sm">
                    {log.ip_address || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
