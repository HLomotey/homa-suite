import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integration/supabase/client';
import { toast } from 'sonner';

export function BiweeklyAmountUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<{ count: number; success: boolean } | null>(null);

  const handleUpdateAmounts = async () => {
    setIsUpdating(true);
    setUpdateResult(null);
    
    try {
      // First, get count of records to update
      const { data: countData, error: countError } = await (supabase
        .from('billing') as any)
        .select('id', { count: 'exact' })
        .gt('rent_amount', 0);

      if (countError) {
        throw countError;
      }

      const recordCount = countData?.length || 0;
      
      if (recordCount === 0) {
        toast.info('No billing records found to update');
        setUpdateResult({ count: 0, success: true });
        return;
      }

      // Update all billing records to halve the rent amount
      const { error: updateError } = await supabase.rpc('halve_billing_amounts');

      if (updateError) {
        throw updateError;
      }

      setUpdateResult({ count: recordCount, success: true });
      toast.success(`Successfully updated ${recordCount} billing records`);
      
    } catch (error) {
      console.error('Error updating billing amounts:', error);
      toast.error('Failed to update billing amounts');
      setUpdateResult({ count: 0, success: false });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          Amount Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-white/80 text-sm">
          <p>This tool will halve all existing billing record amounts.</p>
          <p className="mt-2 text-yellow-300">⚠️ This action cannot be undone. Make sure to backup your data first.</p>
        </div>
        
        {updateResult && (
          <div className={`p-3 rounded-lg border ${
            updateResult.success 
              ? 'bg-green-900/20 border-green-500/30 text-green-300' 
              : 'bg-red-900/20 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {updateResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>
                {updateResult.success 
                  ? `Successfully updated ${updateResult.count} billing records` 
                  : 'Failed to update billing records'
                }
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpdateAmounts}
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Halving Amounts...
            </>
          ) : (
            'Halve All Amounts'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
