import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integration/supabase/client';

export function TransportationDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Running transportation billing diagnostics...');

      // 1. Check all assignments
      const { data: allAssignments, error: allError } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 All assignments:', allAssignments?.length || 0);

      // 2. Check assignments with transportation_agreement
      const { data: transportAssignments, error: transportError } = await supabase
        .from('assignments')
        .select('*')
        .eq('transportation_agreement', true);

      console.log('🚌 Transportation assignments:', transportAssignments?.length || 0);

      // 3. Check assignments with tenant_id
      const { data: assignmentsWithTenant, error: tenantError } = await supabase
        .from('assignments')
        .select('*')
        .not('tenant_id', 'is', null);

      console.log('👤 Assignments with tenant_id:', assignmentsWithTenant?.length || 0);

      // 4. Check external staff
      const { data: externalStaff, error: staffError } = await supabase
        .from('external_staff')
        .select('id, "PAYROLL FIRST NAME", "PAYROLL LAST NAME", "POSITION STATUS"')
        .eq('"POSITION STATUS"', 'Active');

      console.log('👥 Active external staff:', externalStaff?.length || 0);

      // 5. Check assignments table schema
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('assignments')
        .select('*')
        .limit(1);

      const availableColumns = schemaInfo && schemaInfo.length > 0 ? Object.keys(schemaInfo[0]) : [];

      setDebugInfo({
        totalAssignments: allAssignments?.length || 0,
        transportationAssignments: transportAssignments?.length || 0,
        assignmentsWithTenant: assignmentsWithTenant?.length || 0,
        activeExternalStaff: externalStaff?.length || 0,
        availableColumns,
        sampleAssignment: allAssignments?.[0] || null,
        transportationSample: transportAssignments?.[0] || null,
        errors: {
          allError: allError?.message,
          transportError: transportError?.message,
          tenantError: tenantError?.message,
          staffError: staffError?.message,
          schemaError: schemaError?.message
        }
      });

    } catch (error) {
      console.error('Diagnostics error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔍 Transportation Billing Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={isLoading}>
          {isLoading ? 'Running Diagnostics...' : 'Run Transportation Diagnostics'}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-semibold">📊 Total Assignments</h3>
                <p className="text-2xl font-bold">{debugInfo.totalAssignments}</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold">🚌 Transportation Assignments</h3>
                <p className="text-2xl font-bold">{debugInfo.transportationAssignments}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded">
                <h3 className="font-semibold">👤 Assignments with Tenant ID</h3>
                <p className="text-2xl font-bold">{debugInfo.assignmentsWithTenant}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <h3 className="font-semibold">👥 Active External Staff</h3>
                <p className="text-2xl font-bold">{debugInfo.activeExternalStaff}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">📋 Available Assignment Columns</h3>
              <div className="flex flex-wrap gap-2">
                {debugInfo.availableColumns.map((col: string) => (
                  <span key={col} className="px-2 py-1 bg-blue-100 rounded text-sm">
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {debugInfo.sampleAssignment && (
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">📄 Sample Assignment</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo.sampleAssignment, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.transportationSample && (
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold mb-2">🚌 Sample Transportation Assignment</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo.transportationSample, null, 2)}
                </pre>
              </div>
            )}

            {Object.values(debugInfo.errors).some(Boolean) && (
              <div className="p-4 bg-red-50 rounded">
                <h3 className="font-semibold mb-2">❌ Errors Found</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo.errors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
