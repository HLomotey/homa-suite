import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integration/supabase/client';
import { Database } from 'lucide-react';

export function DatabaseDiagnostic() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runDiagnostic = async () => {
    setIsChecking(true);
    const logs: string[] = [];
    
    try {
      // 1. Check if properties table exists
      const { data: propTest, error: propTestError } = await (supabase
        .from('properties') as any)
        .select('id')
        .limit(1);

      if (propTestError) {
        logs.push(`❌ Properties table error: ${propTestError.message}`);
      } else {
        logs.push(`✅ Properties table exists`);
      }

      // 2. Check if rooms table exists
      const { data: roomTest, error: roomTestError } = await (supabase
        .from('rooms') as any)
        .select('id')
        .limit(1);

      if (roomTestError) {
        logs.push(`❌ Rooms table error: ${roomTestError.message}`);
      } else {
        logs.push(`✅ Rooms table exists`);
      }

      // 3. Try to insert a test property
      const testProperty = {
        id: '550e8400-e29b-41d4-a716-446655440000', // Test UUID
        title: 'Test Property',
        address: 'Test Address',
        price: 1000,
        bedrooms: 1,
        bathrooms: 1,
        area: 1000,
        type: 'Apartment',
        status: 'Rented',
        image: 'test.jpg',
        description: 'Test property'
      };

      const { data: insertResult, error: insertError } = await (supabase
        .from('properties') as any)
        .insert(testProperty)
        .select();

      if (insertError) {
        logs.push(`❌ Property insert failed: ${insertError.message}`);
        logs.push(`💡 Error details: ${JSON.stringify(insertError, null, 2)}`);
      } else {
        logs.push(`✅ Test property inserted successfully`);
        
        // Clean up test property
        await (supabase.from('properties') as any).delete().eq('id', testProperty.id);
        logs.push(`🧹 Test property cleaned up`);
      }

      // 4. Check assignment property data
      const { data: assignments, error: assignError } = await (supabase
        .from('assignments') as any)
        .select('property_id, property_name, room_id, room_name')
        .not('property_id', 'is', null)
        .limit(3);

      if (assignError) {
        logs.push(`❌ Assignment query error: ${assignError.message}`);
      } else {
        logs.push(`📋 Sample assignment data:`);
        (assignments || []).forEach((a: any, i: number) => {
          logs.push(`  ${i + 1}. Property: ${a.property_name} (ID: ${a.property_id?.slice(0, 8)}...)`);
          logs.push(`     Room: ${a.room_name} (ID: ${a.room_id?.slice(0, 8)}...)`);
        });
      }

      setResults(logs);
      
    } catch (error) {
      logs.push(`💥 Diagnostic failed: ${error}`);
      setResults(logs);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-400">
          <Database className="h-5 w-5" />
          Database Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDiagnostic}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Running Diagnostic...' : 'Run Database Diagnostic'}
        </Button>

        {results.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1 font-mono text-xs max-h-64 overflow-y-auto">
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
