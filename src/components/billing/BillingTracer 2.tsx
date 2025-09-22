import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integration/supabase/client';
import { Bug } from 'lucide-react';

export function BillingTracer() {
  const [isTracing, setIsTracing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const traceBillingGeneration = async () => {
    setIsTracing(true);
    const traceLogs: string[] = [];
    
    try {
      traceLogs.push('🔍 TRACING BILLING GENERATION FOR AUG 16-31, 2025');
      
      // 1. Check assignments for Aug 16-31, 2025
      const { data: assignments, error: assignError } = await (supabase
        .from('assignments') as any)
        .select('*')
        .not('tenant_id', 'is', null)
        .or('end_date.is.null,end_date.gte.2025-08-16')
        .lte('start_date', '2025-08-31');

      if (assignError) {
        traceLogs.push(`❌ Assignment query failed: ${assignError.message}`);
        setLogs(traceLogs);
        return;
      }

      traceLogs.push(`📋 Found ${assignments?.length || 0} assignments matching Aug 16-31, 2025`);

      if (!assignments || assignments.length === 0) {
        traceLogs.push('❌ NO ASSIGNMENTS FOUND - This is why billing fails!');
        setLogs(traceLogs);
        return;
      }

      // 2. Check external staff for each assignment
      const tenantIds = assignments.map((a: any) => a.tenant_id);
      const { data: staffData, error: staffError } = await (supabase
        .from('external_staff') as any)
        .select('id, "HIRE DATE", "TERMINATION DATE", "POSITION STATUS"')
        .in('id', tenantIds);

      if (staffError) {
        traceLogs.push(`❌ External staff query failed: ${staffError.message}`);
        setLogs(traceLogs);
        return;
      }

      traceLogs.push(`👥 Found ${staffData?.length || 0} external staff records`);

      // 3. Trace filtering logic
      const staffMap = new Map();
      (staffData || []).forEach((staff: any) => {
        staffMap.set(staff.id, staff);
      });

      let validCount = 0;
      assignments.forEach((assignment: any, index: number) => {
        traceLogs.push(`\n🔍 Assignment ${index + 1}:`);
        traceLogs.push(`  Tenant: ${assignment.tenant_name} (${assignment.tenant_id})`);
        traceLogs.push(`  Property: ${assignment.property_name} (${assignment.property_id})`);
        traceLogs.push(`  Assignment: ${assignment.start_date} to ${assignment.end_date || 'ongoing'}`);
        traceLogs.push(`  Status: ${assignment.status}`);
        
        const staff = staffMap.get(assignment.tenant_id);
        if (!staff) {
          traceLogs.push(`  ❌ NO EXTERNAL STAFF RECORD FOUND`);
          return;
        }

        traceLogs.push(`  Staff Status: ${staff["POSITION STATUS"]}`);
        traceLogs.push(`  Employment: ${staff["HIRE DATE"]} to ${staff["TERMINATION DATE"] || 'Active'}`);

        // Check if staff is active (not terminated)
        const positionStatus = staff["POSITION STATUS"];
        const isActive = positionStatus === 'Active' || positionStatus === 'A - Active' || !positionStatus;
        const isTerminated = positionStatus === 'Terminated' || positionStatus === 'T - Terminated';
        
        if (isTerminated || !isActive) {
          traceLogs.push(`  ❌ STAFF NOT ACTIVE: ${positionStatus}`);
          return;
        }

        // Check employment overlap
        const hireDate = staff["HIRE DATE"];
        const termDate = staff["TERMINATION DATE"];
        
        if (hireDate && hireDate > '2025-08-31') {
          traceLogs.push(`  ❌ HIRED AFTER BILLING PERIOD: ${hireDate}`);
          return;
        }
        if (termDate && termDate < '2025-08-16') {
          traceLogs.push(`  ❌ TERMINATED BEFORE BILLING PERIOD: ${termDate}`);
          return;
        }

        traceLogs.push(`  ✅ VALID FOR BILLING`);
        validCount++;
      });

      traceLogs.push(`\n🎯 FINAL RESULT: ${validCount} assignments valid for billing`);

      if (validCount === 0) {
        traceLogs.push('❌ NO VALID ASSIGNMENTS - This explains zero billing records!');
      }

      setLogs(traceLogs);
      
    } catch (error) {
      traceLogs.push(`💥 Trace failed: ${error}`);
      setLogs(traceLogs);
    } finally {
      setIsTracing(false);
    }
  };

  return (
    <Card className="w-full border-red-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <Bug className="h-5 w-5" />
          Billing Generation Tracer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Trace Billing Logic:</strong> Step-by-step trace of why Aug 16-31, 2025 
            generates zero billing records despite having assignments.
          </AlertDescription>
        </Alert>

        <Button
          onClick={traceBillingGeneration}
          disabled={isTracing}
          className="w-full"
          variant="destructive"
        >
          {isTracing ? 'Tracing...' : 'Trace Billing Generation'}
        </Button>

        {logs.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-line">
                {logs.join('\n')}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
