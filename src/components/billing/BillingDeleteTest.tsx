import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integration/supabase/client';
import { toast } from 'sonner';

export function BillingDeleteTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDeleteTest = async () => {
    setIsLoading(true);
    try {
      // First, let's get a billing record to test with
      const { data: billingRecords, error: fetchError } = await supabase
        .from('billing')
        .select('*')
        .limit(1);

      if (fetchError) {
        throw new Error(`Failed to fetch billing records: ${fetchError.message}`);
      }

      if (!billingRecords || billingRecords.length === 0) {
        setTestResults({ error: 'No billing records found to test with' });
        return;
      }

      const testRecord = billingRecords[0];
      console.log('🧪 Testing delete with record:', testRecord);

      // Test 1: Check if we can select the record
      const { data: selectTest, error: selectError } = await supabase
        .from('billing')
        .select('*')
        .eq('id', (testRecord as any).id)
        .single();

      // Test 2: Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // Test 3: Check if there are any foreign key dependencies
      const { data: deductionDeps, error: deductionError } = await supabase
        .from('billing_deductions')
        .select('id')
        .eq('billing_id', (testRecord as any).id);

      // Test 4: Try to delete (but we'll create a test record first)
      // Let's create a test record to delete safely
      const { data: testInsert, error: insertError } = await (supabase
        .from('billing') as any)
        .insert({
          tenant_id: (testRecord as any).tenant_id,
          property_id: (testRecord as any).property_id,
          property_name: 'TEST DELETE',
          room_id: (testRecord as any).room_id,
          room_name: (testRecord as any).room_name,
          rent_amount: 1.00,
          payment_status: 'unpaid',
          billing_type: 'housing',
          period_start: '2025-01-01',
          period_end: '2025-01-15',
          start_date: '2025-01-01'
        })
        .select()
        .single();

      let deleteResult = null;
      let deleteError = null;

      if (testInsert && !insertError) {
        // Now try to delete the test record
        const { data: deleteData, error: delError } = await supabase
          .from('billing')
          .delete()
          .eq('id', (testInsert as any).id)
          .select();

        deleteResult = deleteData;
        deleteError = delError;
      }

      setTestResults({
        originalRecord: testRecord,
        selectTest: { data: selectTest, error: selectError },
        userTest: { user: user?.id, error: userError },
        deductionDeps: { count: deductionDeps?.length || 0, error: deductionError },
        insertTest: { data: testInsert, error: insertError },
        deleteTest: { data: deleteResult, error: deleteError },
        success: !deleteError && deleteResult
      });

    } catch (error) {
      console.error('Delete test error:', error);
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🗑️ Billing Delete Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDeleteTest} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Run Delete Test'}
        </Button>

        {testResults && (
          <div className="space-y-4">
            {testResults.error ? (
              <div className="p-4 bg-red-50 rounded">
                <h3 className="font-semibold text-red-800">❌ Error</h3>
                <p className="text-sm text-red-600">{testResults.error}</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 rounded">
                  <h3 className="font-semibold">📄 Test Record</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testResults.originalRecord, null, 2)}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded ${testResults.selectTest.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className="font-semibold">🔍 Select Test</h3>
                    <p className="text-sm">
                      {testResults.selectTest.error ? 
                        `Error: ${testResults.selectTest.error.message}` : 
                        'Can read record ✅'
                      }
                    </p>
                  </div>

                  <div className={`p-4 rounded ${testResults.userTest.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className="font-semibold">👤 User Test</h3>
                    <p className="text-sm">
                      {testResults.userTest.error ? 
                        `Error: ${testResults.userTest.error.message}` : 
                        `User ID: ${testResults.userTest.user}`
                      }
                    </p>
                  </div>

                  <div className={`p-4 rounded ${testResults.deductionDeps.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className="font-semibold">🔗 Dependencies</h3>
                    <p className="text-sm">
                      {testResults.deductionDeps.error ? 
                        `Error: ${testResults.deductionDeps.error.message}` : 
                        `Deductions: ${testResults.deductionDeps.count}`
                      }
                    </p>
                  </div>

                  <div className={`p-4 rounded ${testResults.deleteTest.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className="font-semibold">🗑️ Delete Test</h3>
                    <p className="text-sm">
                      {testResults.deleteTest.error ? 
                        `Error: ${testResults.deleteTest.error.message}` : 
                        'Delete successful ✅'
                      }
                    </p>
                  </div>
                </div>

                {testResults.deleteTest.error && (
                  <div className="p-4 bg-yellow-50 rounded">
                    <h3 className="font-semibold">🔍 Delete Error Details</h3>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(testResults.deleteTest.error, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
