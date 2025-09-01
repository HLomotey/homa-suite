import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integration/supabase/client';
import { Search } from 'lucide-react';

export function AssignmentDataChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any[]>([]);

  const checkAssignments = async () => {
    setIsChecking(true);
    try {
      // Get all assignments with their dates
      const { data: assignments, error } = await (supabase
        .from('assignments') as any)
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        return;
      }

      console.log('All assignments data:', assignments);
      setAssignmentData(assignments || []);

      // Check specifically for August 2025 assignments
      const august2025Assignments = (assignments || []).filter((a: any) => {
        const startDate = a.start_date;
        const endDate = a.end_date;
        
        // Check if assignment overlaps with August 2025
        const overlapsAugust = startDate <= '2025-08-31' && 
                              (!endDate || endDate >= '2025-08-01');
        
        return overlapsAugust;
      });

      console.log(`Assignments overlapping August 2025: ${august2025Assignments.length}`);
      august2025Assignments.forEach((a: any, i: number) => {
        console.log(`  ${i + 1}. ${a.tenant_name} - ${a.property_name} - ${a.room_name} (${a.start_date} to ${a.end_date || 'ongoing'})`);
      });

      // Check specifically for Aug 16-31, 2025
      const aug16to31Assignments = (assignments || []).filter((a: any) => {
        const startDate = a.start_date;
        const endDate = a.end_date;
        
        // Check if assignment overlaps with Aug 16-31, 2025
        const overlapsAug16to31 = startDate <= '2025-08-31' && 
                                 (!endDate || endDate >= '2025-08-16');
        
        return overlapsAug16to31;
      });

      console.log(`Assignments overlapping Aug 16-31, 2025: ${aug16to31Assignments.length}`);
      aug16to31Assignments.forEach((a: any, i: number) => {
        console.log(`  ${i + 1}. ${a.tenant_name} - ${a.property_name} - ${a.room_name} (${a.start_date} to ${a.end_date || 'ongoing'})`);
      });

    } catch (error) {
      console.error('Error checking assignments:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Assignment Data Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={checkAssignments}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Checking...' : 'Check Assignment Data'}
        </Button>

        {assignmentData.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Assignment Records Found</h4>
              <Badge>{assignmentData.length} total</Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentData.slice(0, 10).map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {assignment.tenant_name || 'N/A'}
                      <div className="text-xs text-muted-foreground">
                        ID: {assignment.tenant_id?.slice(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>{assignment.property_name}</TableCell>
                    <TableCell>{assignment.room_name}</TableCell>
                    <TableCell>{assignment.start_date}</TableCell>
                    <TableCell>{assignment.end_date || 'Ongoing'}</TableCell>
                    <TableCell>${assignment.rent_amount}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.status === 'Active' ? 'default' : 'secondary'}>
                        {assignment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {assignmentData.length > 10 && (
              <p className="text-sm text-muted-foreground">
                Showing first 10 of {assignmentData.length} assignments
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
