import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integration/supabase/client';
import { Building, AlertTriangle } from 'lucide-react';

export function PropertyDataChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<{
    propertiesCount: number;
    roomsCount: number;
    uniquePropertyIds: string[];
    uniqueRoomIds: string[];
    sampleAssignments: any[];
  } | null>(null);

  const checkPropertyData = async () => {
    setIsChecking(true);
    try {
      console.log('🏢 Checking property and room data...');

      // 1. Check properties table
      const { count: propertiesCount, error: propError } = await (supabase
        .from('properties') as any)
        .select('*', { count: 'exact', head: true });

      // 2. Check rooms table  
      const { count: roomsCount, error: roomError } = await (supabase
        .from('rooms') as any)
        .select('*', { count: 'exact', head: true });

      // 3. Get unique property_ids from assignments
      const { data: assignments, error: assignError } = await (supabase
        .from('assignments') as any)
        .select('property_id, room_id, property_name, room_name, tenant_name, start_date, end_date')
        .not('property_id', 'is', null)
        .limit(10);

      if (assignError) {
        console.error('Error fetching assignments:', assignError);
      }

      const uniquePropertyIds = [...new Set((assignments || []).map((a: any) => a.property_id))];
      const uniqueRoomIds = [...new Set((assignments || []).map((a: any) => a.room_id))];

      console.log('🔍 Property data analysis:', {
        propertiesInTable: propertiesCount,
        roomsInTable: roomsCount,
        uniquePropertyIdsInAssignments: uniquePropertyIds.length,
        uniqueRoomIdsInAssignments: uniqueRoomIds.length
      });

      setResults({
        propertiesCount: propertiesCount || 0,
        roomsCount: roomsCount || 0,
        uniquePropertyIds,
        uniqueRoomIds,
        sampleAssignments: assignments || []
      });

    } catch (error) {
      console.error('Property check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Property Data Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={checkPropertyData}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Checking...' : 'Check Property Data'}
        </Button>

        {results && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Property Data Analysis:</strong>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Properties in table:</span>
                    <Badge variant={results.propertiesCount > 0 ? "default" : "destructive"}>
                      {results.propertiesCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rooms in table:</span>
                    <Badge variant={results.roomsCount > 0 ? "default" : "destructive"}>
                      {results.roomsCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unique property IDs in assignments:</span>
                    <Badge variant="outline">
                      {results.uniquePropertyIds.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unique room IDs in assignments:</span>
                    <Badge variant="outline">
                      {results.uniqueRoomIds.length}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {results.propertiesCount === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Properties Data!</strong>
                  <br />
                  The properties table is empty but assignments reference property_id. 
                  This breaks foreign key relationships and prevents billing generation.
                  <br /><br />
                  <strong>Solutions:</strong>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    <li>Populate properties table with data from assignments</li>
                    <li>Remove foreign key constraint temporarily</li>
                    <li>Use property_name from assignments instead of property_id</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {results.sampleAssignments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sample Assignment Property Data:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property ID</TableHead>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Room ID</TableHead>
                      <TableHead>Room Name</TableHead>
                      <TableHead>Tenant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.sampleAssignments.slice(0, 5).map((assignment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {assignment.property_id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{assignment.property_name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {assignment.room_id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{assignment.room_name}</TableCell>
                        <TableCell>{assignment.tenant_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
