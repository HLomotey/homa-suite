import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integration/supabase/client';
import { getBillingWindowsForMonth } from '@/lib/billing/semimonthly';
import { generateBillingForMonth } from '@/lib/billing/generateForMonth';
import { generateTransportationBillingForMonth } from '@/lib/billing/generateTransportationBilling';
import { generateSecurityDepositBillingForMonth, generateBusCardBillingForMonth } from '@/lib/billing/generateDeductionBilling';
import { useAuth } from '@/contexts/AuthContext';

interface BillingPeriodManagerProps {
  onPeriodDeleted?: (count: number) => void;
  onPeriodRegenerated?: (count: number) => void;
}

export function BillingPeriodManager({ onPeriodDeleted, onPeriodRegenerated }: BillingPeriodManagerProps) {
  const authContext = useAuth();
  const userRole = (authContext as any)?.userRole || (authContext as any)?.role || 'user';
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Form state
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [period, setPeriod] = useState('both');
  const [billingTypes, setBillingTypes] = useState<string[]>(['all']);
  
  // Results state
  const [lastDeleteResult, setLastDeleteResult] = useState<{ count: number; timestamp: string } | null>(null);
  const [lastRegenResult, setLastRegenResult] = useState<{ count: number; timestamp: string } | null>(null);
  const [periodSummary, setPeriodSummary] = useState<any>(null);

  // Check if user has admin privileges
  const isAdmin = userRole === 'admin' || userRole === 'administrator';

  if (!isAdmin) {
    return (
      <Card className="w-full bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-500/20 border-red-500/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This functionality is restricted to administrators only. Your current role: {userRole || 'Unknown'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Load billing period summary
  const loadPeriodSummary = async () => {
    if (!year || !month) return;

    try {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const [w1, w2] = getBillingWindowsForMonth(yearNum, monthNum);

      let dateFilter = '';
      if (period === 'first') {
        dateFilter = `billing_period_start >= '${w1.start.toISODate()}' AND billing_period_end <= '${w1.end.toISODate()}'`;
      } else if (period === 'second') {
        dateFilter = `billing_period_start >= '${w2.start.toISODate()}' AND billing_period_end <= '${w2.end.toISODate()}'`;
      } else {
        dateFilter = `billing_period_start >= '${w1.start.toISODate()}' AND billing_period_end <= '${w2.end.toISODate()}'`;
      }

      const { data, error } = await supabase
        .from('billing')
        .select('billing_type, COUNT(*) as count, SUM(amount) as total_amount')
        .filter('billing_period_start', 'gte', w1.start.toISODate())
        .filter('billing_period_end', 'lte', w2.end.toISODate());

      if (error) throw error;

      setPeriodSummary({
        period1: `${w1.start.toFormat('MMM dd')} - ${w1.end.toFormat('MMM dd')}`,
        period2: `${w2.start.toFormat('MMM dd')} - ${w2.end.toFormat('MMM dd, yyyy')}`,
        data: data || []
      });
    } catch (error) {
      console.error('Error loading period summary:', error);
      toast.error('Failed to load billing period summary');
    }
  };

  // Delete billing period
  const handleDeletePeriod = async () => {
    if (!year || !month) {
      toast.error('Please select year and month');
      return;
    }

    setIsDeleting(true);
    try {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const [w1, w2] = getBillingWindowsForMonth(yearNum, monthNum);

      let deleteQuery = supabase.from('billing').delete();

      if (period === 'first') {
        deleteQuery = deleteQuery
          .gte('billing_period_start', w1.start.toISODate())
          .lte('billing_period_end', w1.end.toISODate());
      } else if (period === 'second') {
        deleteQuery = deleteQuery
          .gte('billing_period_start', w2.start.toISODate())
          .lte('billing_period_end', w2.end.toISODate());
      } else {
        deleteQuery = deleteQuery
          .gte('billing_period_start', w1.start.toISODate())
          .lte('billing_period_end', w2.end.toISODate());
      }

      // Filter by billing types if not 'all'
      if (!billingTypes.includes('all')) {
        deleteQuery = deleteQuery.in('billing_type', billingTypes);
      }

      const { data, error, count } = await deleteQuery;
      if (error) throw error;

      const deletedCount = count || data?.length || 0;
      const result = { count: deletedCount, timestamp: new Date().toLocaleString() };
      setLastDeleteResult(result);

      const periodText = period === 'both' ? 'both periods' : period === 'first' ? 'first period' : 'second period';
      const typesText = billingTypes.includes('all') ? 'all billing types' : billingTypes.join(', ');
      
      toast.success(`Deleted ${deletedCount} billing records for ${monthNum}/${yearNum} (${periodText}, ${typesText})`);
      onPeriodDeleted?.(deletedCount);
      
      // Refresh summary
      loadPeriodSummary();
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('Delete period error:', error);
      toast.error(`Failed to delete billing period: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Regenerate billing period
  const handleRegeneratePeriod = async () => {
    if (!year || !month) {
      toast.error('Please select year and month');
      return;
    }

    setIsRegenerating(true);
    try {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      let totalGenerated = 0;

      // Generate based on selected billing types
      if (billingTypes.includes('all') || billingTypes.includes('housing')) {
        await generateBillingForMonth(yearNum, monthNum);
        totalGenerated += 2; // Approximate count for housing
      }

      if (billingTypes.includes('all') || billingTypes.includes('transportation')) {
        const count = await generateTransportationBillingForMonth(yearNum, monthNum);
        totalGenerated += count;
      }

      if (billingTypes.includes('all') || billingTypes.includes('security_deposit')) {
        const count = await generateSecurityDepositBillingForMonth(yearNum, monthNum);
        totalGenerated += count;
      }

      if (billingTypes.includes('all') || billingTypes.includes('bus_card')) {
        const count = await generateBusCardBillingForMonth(yearNum, monthNum);
        totalGenerated += count;
      }

      const result = { count: totalGenerated, timestamp: new Date().toLocaleString() };
      setLastRegenResult(result);

      const periodText = period === 'both' ? 'both periods' : period === 'first' ? 'first period' : 'second period';
      const typesText = billingTypes.includes('all') ? 'all billing types' : billingTypes.join(', ');
      
      toast.success(`Regenerated ${totalGenerated} billing records for ${monthNum}/${yearNum} (${periodText}, ${typesText})`);
      onPeriodRegenerated?.(totalGenerated);
      
      // Refresh summary
      loadPeriodSummary();
    } catch (error) {
      console.error('Regenerate period error:', error);
      toast.error(`Failed to regenerate billing period: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Load summary when year/month/period changes
  React.useEffect(() => {
    loadPeriodSummary();
  }, [year, month, period]);

  return (
    <Card className="w-full bg-red-500/10 border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <Calendar className="h-5 w-5" />
          Billing Period Manager
          <span className="text-xs bg-red-500/20 px-2 py-1 rounded">Admin Only</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selection */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="period-year">Year</Label>
            <Input
              id="period-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isDeleting || isRegenerating}
              min="2020"
              max="2030"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period-month">Month</Label>
            <Input
              id="period-month"
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={isDeleting || isRegenerating}
              min="1"
              max="12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period-range">Period Range</Label>
            <Select value={period} onValueChange={setPeriod} disabled={isDeleting || isRegenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both Periods (1-15 & 16-End)</SelectItem>
                <SelectItem value="first">First Period (1-15)</SelectItem>
                <SelectItem value="second">Second Period (16-End)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Billing Types Selection */}
        <div className="space-y-2">
          <Label>Billing Types to Manage</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['all', 'housing', 'transportation', 'security_deposit', 'bus_card', 'flight_agreement'].map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billingTypes.includes(type)}
                  onChange={(e) => {
                    if (type === 'all') {
                      setBillingTypes(e.target.checked ? ['all'] : []);
                    } else {
                      setBillingTypes(prev => {
                        const newTypes = prev.filter(t => t !== 'all');
                        return e.target.checked 
                          ? [...newTypes, type]
                          : newTypes.filter(t => t !== type);
                      });
                    }
                  }}
                  disabled={isDeleting || isRegenerating}
                  className="rounded"
                />
                <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Period Summary */}
        {periodSummary && (
          <Alert className="bg-blue-500/20 border-blue-500/30">
            <AlertDescription>
              <strong>Current Period Summary:</strong>
              <br />
              <strong>Periods:</strong> {periodSummary.period1} & {periodSummary.period2}
              <br />
              <strong>Total Records:</strong> {periodSummary.data.reduce((sum: number, item: any) => sum + (item.count || 0), 0)}
              <br />
              <strong>Total Amount:</strong> ${periodSummary.data.reduce((sum: number, item: any) => sum + (item.total_amount || 0), 0).toFixed(2)}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delete Period */}
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting || isRegenerating || billingTypes.length === 0}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Period
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-500">Confirm Deletion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="bg-red-500/20 border-red-500/30">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>WARNING:</strong> This action cannot be undone!
                    <br />
                    You are about to delete billing records for:
                    <br />
                    <strong>Period:</strong> {month}/{year} ({period === 'both' ? 'both periods' : period === 'first' ? 'first period' : 'second period'})
                    <br />
                    <strong>Types:</strong> {billingTypes.includes('all') ? 'all billing types' : billingTypes.join(', ')}
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeletePeriod}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Confirm Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Regenerate Period */}
          <Button
            onClick={handleRegeneratePeriod}
            disabled={isDeleting || isRegenerating || billingTypes.length === 0}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Period
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {lastDeleteResult && (
          <Alert className="bg-red-500/20 border-red-500/30">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Last Deletion:</strong> {lastDeleteResult.count} records deleted at {lastDeleteResult.timestamp}
            </AlertDescription>
          </Alert>
        )}

        {lastRegenResult && (
          <Alert className="bg-green-500/20 border-green-500/30">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Last Regeneration:</strong> {lastRegenResult.count} records created at {lastRegenResult.timestamp}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Alert className="bg-yellow-500/20 border-yellow-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Instructions:</strong>
            <br />
            1. Select the year, month, and period range to manage
            <br />
            2. Choose which billing types to delete/regenerate (or select "all")
            <br />
            3. Use "Delete Period" to remove existing billing records
            <br />
            4. Use "Regenerate Period" to create new billing records
            <br />
            <strong>Note:</strong> Always delete before regenerating to avoid duplicates
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
