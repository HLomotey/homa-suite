import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Database, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integration/supabase/client';
import { toast } from 'sonner';

export function BillingDebugger() {
  const [isChecking, setIsChecking] = useState(false);
  const [debugData, setDebugData] = useState<{
    assignments: any[];
    externalStaff: any[];
    properties: any[];
    rooms: any[];
    assignmentsWithStaff: any[];
  } | null>(null);

  const runDiagnostics = async () => {
    setIsChecking(true);
    try {
      console.log('Running billing diagnostics...');

      // Check assignments table
      const { data: assignments, error: assignmentsError } = await (supabase
        .from('assignments') as any)
        .select('*')
        .limit(10);

      if (assignmentsError) {
        console.error('Assignments error:', assignmentsError);
      }

      // Check external_staff table
      const { data: externalStaff, error: staffError } = await (supabase
        .from('external_staff') as any)
        .select('id, "PAYROLL FIRST NAME", "PAYROLL LAST NAME", "HIRE DATE", "TERMINATION DATE", "POSITION STATUS"')
        .limit(10);

      if (staffError) {
        console.error('External staff error:', staffError);
      }

      // Check properties table
      const { data: properties, error: propertiesError } = await (supabase
        .from('properties') as any)
        .select('id, name')
        .limit(10);

      if (propertiesError) {
        console.error('Properties error:', propertiesError);
      }

      // Check rooms table
      const { data: rooms, error: roomsError } = await (supabase
        .from('rooms') as any)
        .select('id, name, property_id')
        .limit(10);

      if (roomsError) {
        console.error('Rooms error:', roomsError);
      }

      // Check assignments without joins (since relationships don't exist)
      const { data: assignmentsWithStaff, error: joinError } = await (supabase
        .from('assignments') as any)
        .select('*')
        .not('tenant_id', 'is', null)
        .limit(10);

      if (joinError) {
        console.error('Assignments query error:', joinError);
      }

      setDebugData({
        assignments: assignments || [],
        externalStaff: externalStaff || [],
        properties: properties || [],
        rooms: rooms || [],
        assignmentsWithStaff: assignmentsWithStaff || []
      });

      console.log('Debug data collected:', {
        assignments: assignments?.length || 0,
        externalStaff: externalStaff?.length || 0,
        properties: properties?.length || 0,
        rooms: rooms?.length || 0,
        assignmentsWithStaff: assignmentsWithStaff?.length || 0
      });

    } catch (error) {
      console.error('Diagnostics error:', error);
      toast.error('Failed to run diagnostics');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Billing System Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDiagnostics}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Search className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Check Database Tables
            </>
          )}
        </Button>

        {debugData && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Database Status:</strong>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Assignments:</span>
                    <Badge variant={debugData.assignments.length > 0 ? "default" : "destructive"}>
                      {debugData.assignments.length} records
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>External Staff:</span>
                    <Badge variant={debugData.externalStaff.length > 0 ? "default" : "destructive"}>
                      {debugData.externalStaff.length} records
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Properties:</span>
                    <Badge variant={debugData.properties.length > 0 ? "default" : "destructive"}>
                      {debugData.properties.length} records
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Rooms:</span>
                    <Badge variant={debugData.rooms.length > 0 ? "default" : "destructive"}>
                      {debugData.rooms.length} records
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignments with Staff:</span>
                    <Badge variant={debugData.assignmentsWithStaff.length > 0 ? "default" : "destructive"}>
                      {debugData.assignmentsWithStaff.length} records
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {debugData.assignmentsWithStaff.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sample Assignment Data:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant Name</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Assignment Period</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debugData.assignmentsWithStaff.slice(0, 5).map((assignment, index) => (
                      <TableRow key={index}>
                        <TableCell>{assignment.tenant_name || 'N/A'}</TableCell>
                        <TableCell>{assignment.property_name || 'N/A'}</TableCell>
                        <TableCell>{assignment.room_name || 'N/A'}</TableCell>
                        <TableCell>${assignment.rent_amount || 0}</TableCell>
                        <TableCell>
                          {assignment.start_date} → {assignment.end_date || 'Ongoing'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'Active' ? 'default' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {debugData.assignmentsWithStaff.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>No staff assignments found!</strong> This explains why no billing records are generated.
                  You need to create staff assignments first before generating billing records.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
