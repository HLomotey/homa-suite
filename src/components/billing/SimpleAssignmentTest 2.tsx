import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integration/supabase/client';
import { Search } from 'lucide-react';

export function SimpleAssignmentTest() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runSimpleTest = async () => {
    setIsChecking(true);
    const logs: string[] = [];
    
    try {
      // 1. Count total assignments
      const { count: totalCount, error: countError } = await (supabase
        .from('assignments') as any)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        logs.push(`❌ Error counting assignments: ${countError.message}`);
      } else {
        logs.push(`📊 Total assignments: ${totalCount}`);
      }

      // 2. Get sample assignments
      const { data: sampleAssignments, error: sampleError } = await (supabase
        .from('assignments') as any)
        .select('tenant_id, tenant_name, start_date, end_date, status, property_name, room_name')
        .limit(5);

      if (sampleError) {
        logs.push(`❌ Error fetching sample: ${sampleError.message}`);
      } else {
        logs.push(`📋 Sample assignments fetched: ${sampleAssignments?.length || 0}`);
        sampleAssignments?.forEach((a: any, i: number) => {
          logs.push(`  ${i + 1}. ${a.tenant_name} - ${a.start_date} to ${a.end_date || 'ongoing'} - Status: ${a.status}`);
        });
      }

      // 3. Check assignments with tenant_id
      const { count: withTenantCount, error: tenantError } = await (supabase
        .from('assignments') as any)
        .select('*', { count: 'exact', head: true })
        .not('tenant_id', 'is', null);

      if (tenantError) {
        logs.push(`❌ Error counting with tenant_id: ${tenantError.message}`);
      } else {
        logs.push(`👥 Assignments with tenant_id: ${withTenantCount}`);
      }

      // 4. Check active assignments
      const { count: activeCount, error: activeError } = await (supabase
        .from('assignments') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      if (activeError) {
        logs.push(`❌ Error counting active: ${activeError.message}`);
      } else {
        logs.push(`✅ Active assignments: ${activeCount}`);
      }

      // 5. Test Aug 16-31, 2025 filter
      const { data: aug2025Data, error: aug2025Error } = await (supabase
        .from('assignments') as any)
        .select('tenant_id, tenant_name, start_date, end_date, status')
        .not('tenant_id', 'is', null)
        .or('end_date.is.null,end_date.gte.2025-08-16')
        .lte('start_date', '2025-08-31');

      if (aug2025Error) {
        logs.push(`❌ Error with Aug 2025 filter: ${aug2025Error.message}`);
      } else {
        logs.push(`🗓️ Assignments matching Aug 16-31, 2025 filter: ${aug2025Data?.length || 0}`);
        aug2025Data?.slice(0, 3).forEach((a: any, i: number) => {
          logs.push(`  ${i + 1}. ${a.tenant_name} - ${a.start_date} to ${a.end_date || 'ongoing'} - ${a.status}`);
        });
      }

      // 6. Check external staff count
      const { count: staffCount, error: staffCountError } = await (supabase
        .from('external_staff') as any)
        .select('*', { count: 'exact', head: true });

      if (staffCountError) {
        logs.push(`❌ Error counting external staff: ${staffCountError.message}`);
      } else {
        logs.push(`👤 Total external staff: ${staffCount}`);
      }

      setResults(logs);
      
    } catch (error) {
      logs.push(`💥 Test failed: ${error}`);
      setResults(logs);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Simple Assignment Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runSimpleTest}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Testing...' : 'Run Assignment Test'}
        </Button>

        {results.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1 font-mono text-xs">
                {results.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
