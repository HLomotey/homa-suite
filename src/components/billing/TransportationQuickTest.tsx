import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integration/supabase/client';

export function TransportationQuickTest() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runQuickTest = async () => {
    setIsLoading(true);
    try {
      // Test 1: Get all assignments
      const { data: allAssignments } = await supabase
        .from('assignments')
        .select('*')
        .limit(10);

      // Test 2: Check transportation_agreement values
      const transportValues = (allAssignments || []).map((a: any) => ({
        id: a.id,
        transportation_agreement: a.transportation_agreement,
        transport_amount: a.transport_amount,
        tenant_id: a.tenant_id
      }));

      // Test 3: Try different queries
      const { data: booleanTrue } = await supabase
        .from('assignments')
        .select('*')
        .eq('transportation_agreement', true);

      const { data: stringTrue } = await supabase
        .from('assignments')
        .select('*')
        .eq('transportation_agreement', 'true');

      const { data: withTransportAmount } = await supabase
        .from('assignments')
        .select('*')
        .not('transport_amount', 'is', null);

      setResults({
        totalAssignments: allAssignments?.length || 0,
        transportValues: transportValues.slice(0, 5),
        booleanTrueCount: booleanTrue?.length || 0,
        stringTrueCount: stringTrue?.length || 0,
        withTransportAmountCount: withTransportAmount?.length || 0,
        sampleAssignment: allAssignments?.[0] || null
      });

    } catch (error) {
      console.error('Quick test error:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🚌 Transportation Quick Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runQuickTest} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Run Quick Test'}
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-semibold">📊 Total Assignments</h3>
                <p className="text-2xl font-bold">{results.totalAssignments}</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold">✅ Boolean True</h3>
                <p className="text-2xl font-bold">{results.booleanTrueCount}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded">
                <h3 className="font-semibold">📝 String "true"</h3>
                <p className="text-2xl font-bold">{results.stringTrueCount}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <h3 className="font-semibold">💰 With Transport Amount</h3>
                <p className="text-2xl font-bold">{results.withTransportAmountCount}</p>
              </div>
            </div>

            {results.transportValues && (
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">🔍 Sample Transportation Data</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(results.transportValues, null, 2)}
                </pre>
              </div>
            )}

            {results.sampleAssignment && (
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">📄 Sample Assignment (Full)</h3>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(results.sampleAssignment, null, 2)}
                </pre>
              </div>
            )}

            {results.error && (
              <div className="p-4 bg-red-50 rounded">
                <h3 className="font-semibold mb-2">❌ Error</h3>
                <p className="text-sm">{results.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
