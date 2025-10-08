import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateBillingForDateRange, generateAugust16To31 } from '@/lib/billing/generateForDateRange';
import { BillingDebugger } from './BillingDebugger';
import { AssignmentDataChecker } from './AssignmentDataChecker';
import { AssignmentAnalyzer } from './AssignmentAnalyzer';
import { SimpleAssignmentTest } from './SimpleAssignmentTest';
import { PropertyDataChecker } from './PropertyDataChecker';
import { PropertySeeder } from './PropertySeeder';
import { QuickPropertyFix } from './QuickPropertyFix';
import { DatabaseDiagnostic } from './DatabaseDiagnostic';
import { BillingTracer } from './BillingTracer';
import { BiweeklyAmountUpdater } from './BiweeklyAmountUpdater';

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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Manual Billing Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Actions</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BiweeklyAmountUpdater />
            <QuickPropertyFix />
            <DatabaseDiagnostic />
            <BillingTracer />
          </div>
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
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Custom Date Range</Label>
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>

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

        {/* Debug Section */}
        <BillingTracer />
        <DatabaseDiagnostic />
        <QuickPropertyFix />
        <PropertyDataChecker />
        <SimpleAssignmentTest />
      </CardContent>
    </Card>
  );
}

export default ManualBillingGenerator;
