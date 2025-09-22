import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integration/supabase/client';
import { Search, Calendar, Users, AlertTriangle } from 'lucide-react';

export function AssignmentAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    totalAssignments: number;
    activeAssignments: number;
    august2025Assignments: number;
    aug16to31Assignments: number;
    assignmentsWithTenantId: number;
    assignmentsWithExternalStaff: number;
    sampleAssignments: any[];
    dateRangeBreakdown: any[];
  } | null>(null);

  const analyzeAssignments = async () => {
    setIsAnalyzing(true);
    try {
      console.log('🔍 Starting comprehensive assignment analysis...');

      // 1. Get all assignments
      const { data: allAssignments, error: assignmentsError } = await (supabase
        .from('assignments') as any)
        .select('*')
        .order('start_date', { ascending: false });

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        return;
      }

      console.log(`📊 Total assignments found: ${allAssignments?.length || 0}`);

      // 2. Filter active assignments
      const activeAssignments = (allAssignments || []).filter((a: any) => 
        a.status === 'Active'
      );

      // 3. Check assignments with tenant_id
      const assignmentsWithTenantId = (allAssignments || []).filter((a: any) => 
        a.tenant_id && a.tenant_id.trim() !== ''
      );

      // 4. Check August 2025 overlaps
      const august2025Assignments = (allAssignments || []).filter((a: any) => {
        const startDate = a.start_date;
        const endDate = a.end_date;
        
        return startDate <= '2025-08-31' && (!endDate || endDate >= '2025-08-01');
      });

      // 5. Check Aug 16-31, 2025 overlaps
      const aug16to31Assignments = (allAssignments || []).filter((a: any) => {
        const startDate = a.start_date;
        const endDate = a.end_date;
        
        return startDate <= '2025-08-31' && (!endDate || endDate >= '2025-08-16');
      });

      // 6. Check external staff relationships
      const tenantIds = assignmentsWithTenantId.map((a: any) => a.tenant_id);
      const { data: externalStaffData, error: staffError } = await (supabase
        .from('external_staff') as any)
        .select('id, "PAYROLL FIRST NAME", "PAYROLL LAST NAME", "HIRE DATE", "TERMINATION DATE", "POSITION STATUS"')
        .in('id', tenantIds);

      if (staffError) {
        console.error('Error fetching external staff:', staffError);
      }

      const assignmentsWithExternalStaff = assignmentsWithTenantId.filter((a: any) => 
        (externalStaffData || []).some((s: any) => s.id === a.tenant_id)
      );

      // 7. Date range breakdown
      const dateRangeBreakdown = [
        {
          range: 'All time',
          count: allAssignments?.length || 0,
          description: 'Total assignments in database'
        },
        {
          range: 'Active status',
          count: activeAssignments.length,
          description: 'Assignments with status = "Active"'
        },
        {
          range: 'With tenant_id',
          count: assignmentsWithTenantId.length,
          description: 'Assignments with non-null tenant_id'
        },
        {
          range: 'With external staff link',
          count: assignmentsWithExternalStaff.length,
          description: 'Assignments linked to external_staff table'
        },
        {
          range: 'August 2025',
          count: august2025Assignments.length,
          description: 'Assignments overlapping August 2025'
        },
        {
          range: 'Aug 16-31, 2025',
          count: aug16to31Assignments.length,
          description: 'Assignments overlapping Aug 16-31, 2025'
        }
      ];

      console.log('📈 Analysis breakdown:', dateRangeBreakdown);

      // Log detailed info about Aug 16-31 assignments
      console.log('🎯 Aug 16-31, 2025 assignments:');
      aug16to31Assignments.forEach((a: any, i: number) => {
        console.log(`  ${i + 1}. ${a.tenant_name} - ${a.property_name}/${a.room_name} (${a.start_date} to ${a.end_date || 'ongoing'}) - Status: ${a.status}`);
      });

      setAnalysis({
        totalAssignments: allAssignments?.length || 0,
        activeAssignments: activeAssignments.length,
        august2025Assignments: august2025Assignments.length,
        aug16to31Assignments: aug16to31Assignments.length,
        assignmentsWithTenantId: assignmentsWithTenantId.length,
        assignmentsWithExternalStaff: assignmentsWithExternalStaff.length,
        sampleAssignments: aug16to31Assignments.slice(0, 5),
        dateRangeBreakdown
      });

    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Assignment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={analyzeAssignments}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Assignment Data'}
        </Button>

        {analysis && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Analysis Results:</strong>
                <div className="mt-2 space-y-2">
                  {analysis.dateRangeBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.description}:</span>
                      <Badge variant={item.count > 0 ? "default" : "destructive"}>
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>

            {analysis.aug16to31Assignments > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Aug 16-31, 2025 Assignments ({analysis.aug16to31Assignments})
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Assignment Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.sampleAssignments.map((assignment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{assignment.tenant_name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {assignment.tenant_id?.slice(0, 8)}...
                          </div>
                        </TableCell>
                        <TableCell>{assignment.property_name}</TableCell>
                        <TableCell>{assignment.room_name}</TableCell>
                        <TableCell>
                          {assignment.start_date} → {assignment.end_date || 'Ongoing'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'Active' ? 'default' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${assignment.rent_amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {analysis.aug16to31Assignments === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>No assignments found for Aug 16-31, 2025!</strong>
                  <br />
                  This explains why no billing records are generated. Check if:
                  <ul className="mt-2 list-disc list-inside text-sm">
                    <li>Assignment dates are in a different year</li>
                    <li>Assignments end before Aug 16, 2025</li>
                    <li>Assignments start after Aug 31, 2025</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
