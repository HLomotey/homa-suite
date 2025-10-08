import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateBillingForDateRange, generateAugust16To31 } from '@/lib/billing/generateForDateRange';
import { generateAllBillingForMonth } from '@/lib/billing/generateTransportationBilling';
import { generateAllBillingTypesForMonth } from '@/lib/billing/generateDeductionBilling';
import { IndividualBillingGenerators } from './IndividualBillingGenerators';
import { BillingPeriodManager } from './BillingPeriodManager';

interface ManualBillingGeneratorProps {
  onBillingGenerated?: (count: number) => void;
}

export function ManualBillingGenerator({ onBillingGenerated }: ManualBillingGeneratorProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<{
    count: number;
    period: string;
    timestamp: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    // Validate date order
    if (startDate > endDate) {
      toast.error('Start date must be before or equal to end date');
      return;
    }

    setIsGenerating(true);
    try {
      console.log(`Starting billing generation for ${startDate} to ${endDate}`);
      const result = await generateBillingForDateRange(startDate, endDate);
      
      console.log('Billing generation result:', result);
      
      setLastResult({
        count: result.generatedCount,
        period: result.window.label,
        timestamp: new Date().toLocaleString()
      });

      if (result.generatedCount === 0) {
        toast.warning(`No billing records generated for ${result.window.label}. This could mean no active staff assignments were found for this period.`);
      } else {
        toast.success(`Generated ${result.generatedCount} billing records for ${result.window.label}`);
      }
      
      onBillingGenerated?.(result.generatedCount);
    } catch (error) {
      console.error('Billing generation error:', error);
      toast.error(`Failed to generate billing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTransportation = async () => {
    setIsGenerating(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const transportCount = await generateAllBillingForMonth(year, month);
      
      setLastResult({
        count: transportCount,
        period: `${now.toLocaleString('default', { month: 'long', year: 'numeric' })} (Housing + Transportation)`,
        timestamp: new Date().toLocaleString()
      });

      toast.success(`Generated billing records including ${transportCount} transportation records for current month`);
      onBillingGenerated?.(transportCount);
    } catch (error) {
      console.error('Transportation billing generation error:', error);
      toast.error(`Failed to generate transportation billing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAllBillingTypes = async () => {
    setIsGenerating(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const result = await generateAllBillingTypesForMonth(year, month, {
        transportRate: 200,
        securityDepositAmount: 500,
        busCardAmount: 50
      });
      
      setLastResult({
        count: result.totalDeductionRecords + result.transportCount,
        period: `${now.toLocaleString('default', { month: 'long', year: 'numeric' })} (All Billing Types + Deductions)`,
        timestamp: new Date().toLocaleString()
      });

      toast.success(`Generated all billing types: ${result.transportCount} transportation, ${result.securityDepositCount} security deposits, ${result.busCardCount} bus cards`);
      onBillingGenerated?.(result.totalDeductionRecords + result.transportCount);
    } catch (error) {
      console.error('All billing types generation error:', error);
      toast.error(`Failed to generate all billing types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = async (type: 'august16-31' | 'current-month') => {
    setIsGenerating(true);
    try {
      let result;
      
      if (type === 'august16-31') {
        result = await generateAugust16To31(2025);
      } else {
        // Generate for current month
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endOfMonth = new Date(year, month, 0).getDate();
        const endOfMonthStr = `${year}-${month.toString().padStart(2, '0')}-${endOfMonth.toString().padStart(2, '0')}`;
        
        result = await generateBillingForDateRange(startOfMonth, endOfMonthStr);
      }

      setLastResult({
        count: result.generatedCount,
        period: result.window.label,
        timestamp: new Date().toLocaleString()
      });

      toast.success(`Generated ${result.generatedCount} billing records for ${result.window.label}`);
      onBillingGenerated?.(result.generatedCount);
    } catch (error) {
      console.error('Quick billing generation error:', error);
      toast.error(`Failed to generate billing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Individual Billing Generators */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Individual Billing Generators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IndividualBillingGenerators onBillingGenerated={onBillingGenerated} />
        </CardContent>
      </Card>

      {/* Combined Billing Generator */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Combined Billing Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Actions</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickGenerate('august16-31')}
              disabled={isGenerating}
            >
              August 16-31, 2025
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickGenerate('current-month')}
              disabled={isGenerating}
            >
              Current Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTransportation}
              disabled={isGenerating}
              className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
            >
              🚌 Housing + Transportation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAllBillingTypes}
              disabled={isGenerating}
              className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
            >
              💰 All Types + Deductions
            </Button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Custom Date Range</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label className="invisible">Generate</Label>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !startDate || !endDate}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Play className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Billing
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Last Result */}
        {lastResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Last Generation:</strong> {lastResult.count} records created for {lastResult.period}
              <br />
              <span className="text-sm text-muted-foreground">Generated at {lastResult.timestamp}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> This generator creates billing records for staff who have active assignments 
            during the selected period. It checks employment dates from the external staff table and creates 
            billing entries for overlapping periods.
          </AlertDescription>
        </Alert>

      </CardContent>
    </Card>

    {/* Billing Period Manager */}
    <BillingPeriodManager 
      onPeriodDeleted={(count) => {
        toast.success(`Deleted ${count} billing records`);
        onBillingGenerated?.(0); // Trigger refresh
      }}
      onPeriodRegenerated={(count) => {
        toast.success(`Regenerated ${count} billing records`);
        onBillingGenerated?.(count);
      }}
    />
    </div>
  );
}

export default ManualBillingGenerator;
