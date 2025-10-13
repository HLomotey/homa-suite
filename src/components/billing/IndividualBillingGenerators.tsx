import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Bus, Shield, Plane, Play, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateBillingForMonth } from '@/lib/billing/generateForMonth';
import { generateTransportationBillingForMonth } from '@/lib/billing/generateTransportationBilling';
import { generateSecurityDepositBillingForMonth, generateBusCardBillingForMonth } from '@/lib/billing/generateDeductionBilling';
import { getBillingWindowsForMonth } from '@/lib/billing/semimonthly';
import { FlightAgreementGenerator } from './FlightAgreementGenerator';
import { supabase } from '@/integration/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IndividualBillingGeneratorsProps {
  onBillingGenerated?: (count: number, type: string) => void;
}

export function IndividualBillingGenerators({ onBillingGenerated }: IndividualBillingGeneratorsProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<Record<string, { count: number; timestamp: string }>>({});

  // Housing billing state
  const [housingYear, setHousingYear] = useState(new Date().getFullYear().toString());
  const [housingMonth, setHousingMonth] = useState((new Date().getMonth() + 1).toString());
  const [housingPeriod, setHousingPeriod] = useState('both');
  const [housingAssignments, setHousingAssignments] = useState<any[]>([]);

  // Transportation billing state
  const [transportYear, setTransportYear] = useState(new Date().getFullYear().toString());
  const [transportMonth, setTransportMonth] = useState((new Date().getMonth() + 1).toString());
  const [transportPeriod, setTransportPeriod] = useState('both');
  const [transportAssignments, setTransportAssignments] = useState<any[]>([]);

  // Security deposit state
  const [securityYear, setSecurityYear] = useState(new Date().getFullYear().toString());
  const [securityMonth, setSecurityMonth] = useState((new Date().getMonth() + 1).toString());
  const [securityPeriod, setSecurityPeriod] = useState('both');
  const [securityDeductions, setSecurityDeductions] = useState<any[]>([]);

  // Bus card state
  const [busYear, setBusYear] = useState(new Date().getFullYear().toString());
  const [busMonth, setBusMonth] = useState((new Date().getMonth() + 1).toString());
  const [busPeriod, setBusPeriod] = useState('both');
  const [busAssignments, setBusAssignments] = useState<any[]>([]);

  // Load assignment data for housing
  const loadHousingAssignments = async (year: number, month: number) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('housing_agreement', true)
        .not('rent_amount', 'is', null);
      
      if (error) throw error;
      setHousingAssignments(data || []);
      
      // Set default rent amount if assignments found
      if (data && data.length > 0) {
        const avgRent = data.reduce((sum: number, a: any) => sum + (a.rent_amount || 0), 0) / data.length;
        // Don't override if user has already set a value
      }
    } catch (error) {
      console.error('Error loading housing assignments:', error);
    }
  };

  // Load assignment data for transportation
  const loadTransportAssignments = async (year: number, month: number) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('transportation_agreement', true)
        .not('transport_amount', 'is', null);
      
      if (error) throw error;
      setTransportAssignments(data || []);
    } catch (error) {
      console.error('Error loading transport assignments:', error);
    }
  };

  // Load assignment data for bus cards
  const loadBusAssignments = async (year: number, month: number) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('bus_card_agreement', true)
        .not('bus_card_amount', 'is', null);
      
      if (error) throw error;
      setBusAssignments(data || []);
    } catch (error) {
      console.error('Error loading bus card assignments:', error);
    }
  };

  // Load security deposit deductions
  const loadSecurityDeductions = async (year: number, month: number) => {
    try {
      const { data, error } = await supabase
        .from('security_deposit_deductions')
        .select('*')
        .eq('status', 'scheduled');
      
      if (error) throw error;
      setSecurityDeductions(data || []);
    } catch (error) {
      console.error('Error loading security deductions:', error);
    }
  };

  // Load data when year/month changes
  React.useEffect(() => {
    const year = parseInt(housingYear);
    const month = parseInt(housingMonth);
    if (year && month) {
      loadHousingAssignments(year, month);
    }
  }, [housingYear, housingMonth]);

  React.useEffect(() => {
    const year = parseInt(transportYear);
    const month = parseInt(transportMonth);
    if (year && month) {
      loadTransportAssignments(year, month);
    }
  }, [transportYear, transportMonth]);

  React.useEffect(() => {
    const year = parseInt(busYear);
    const month = parseInt(busMonth);
    if (year && month) {
      loadBusAssignments(year, month);
    }
  }, [busYear, busMonth]);

  React.useEffect(() => {
    const year = parseInt(securityYear);
    const month = parseInt(securityMonth);
    if (year && month) {
      loadSecurityDeductions(year, month);
    }
  }, [securityYear, securityMonth]);

  const handleHousingGeneration = async () => {
    if (!housingYear || !housingMonth) {
      toast.error('Please enter year and month for housing billing');
      return;
    }

    setIsGenerating('housing');
    try {
      const year = parseInt(housingYear);
      const month = parseInt(housingMonth);
      
      // Show the billing periods that will be generated
      const [w1, w2] = getBillingWindowsForMonth(year, month);
      const period1 = `${w1.start.toFormat('MMM dd')} - ${w1.end.toFormat('MMM dd')}`;
      const period2 = `${w2.start.toFormat('MMM dd')} - ${w2.end.toFormat('MMM dd, yyyy')}`;
      
      await generateBillingForMonth(year, month);
      
      const result = { count: 2, timestamp: new Date().toLocaleString() }; // 2 semi-monthly periods
      setLastResults(prev => ({ ...prev, housing: result }));
      
      toast.success(`Generated housing billing for ${month}/${year} - Periods: ${period1} & ${period2}`);
      onBillingGenerated?.(result.count, 'Housing');
    } catch (error) {
      console.error('Housing billing generation error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage = 'No valid staff assignments found. Please ensure staff are properly assigned to properties with valid external staff records.';
        } else if (error.message.includes('billing_tenant_fk')) {
          errorMessage = 'Staff assignment references invalid external staff records. Please check staff data integrity.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Failed to generate housing billing: ${errorMessage}`);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleTransportationGeneration = async () => {
    if (!transportYear || !transportMonth) {
      toast.error('Please enter year and month for transportation billing');
      return;
    }

    setIsGenerating('transportation');
    try {
      const year = parseInt(transportYear);
      const month = parseInt(transportMonth);
      
      // Show the billing periods that will be generated
      const [w1, w2] = getBillingWindowsForMonth(year, month);
      const period1 = `${w1.start.toFormat('MMM dd')} - ${w1.end.toFormat('MMM dd')}`;
      const period2 = `${w2.start.toFormat('MMM dd')} - ${w2.end.toFormat('MMM dd, yyyy')}`;
      
      // Use transport amounts from assignments instead of a fixed rate
      const count = await generateTransportationBillingForMonth(year, month);
      
      const result = { count, timestamp: new Date().toLocaleString() };
      setLastResults(prev => ({ ...prev, transportation: result }));
      
      toast.success(`Generated ${count} transportation billing records for ${month}/${year} - Periods: ${period1} & ${period2} (using assignment amounts)`);
      onBillingGenerated?.(count, 'Transportation');
    } catch (error) {
      console.error('Transportation billing generation error:', error);
      toast.error(`Failed to generate transportation billing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleSecurityDepositGeneration = async () => {
    if (!securityYear || !securityMonth) {
      toast.error('Please enter year and month for security deposit billing');
      return;
    }

    setIsGenerating('security');
    try {
      const year = parseInt(securityYear);
      const month = parseInt(securityMonth);
      
      // Show the billing periods that will be generated
      const [w1, w2] = getBillingWindowsForMonth(year, month);
      const period1 = `${w1.start.toFormat('MMM dd')} - ${w1.end.toFormat('MMM dd')}`;
      const period2 = `${w2.start.toFormat('MMM dd')} - ${w2.end.toFormat('MMM dd, yyyy')}`;
      
      // Use pending deduction amounts from deductions table
      const count = await generateSecurityDepositBillingForMonth(year, month);
      
      const result = { count, timestamp: new Date().toLocaleString() };
      setLastResults(prev => ({ ...prev, security: result }));
      
      toast.success(`Generated ${count} security deposit billing records for ${month}/${year} - Periods: ${period1} & ${period2} (using pending deduction amounts)`);
      onBillingGenerated?.(count, 'Security Deposit');
    } catch (error) {
      console.error('Security deposit billing generation error:', error);
      toast.error(`Failed to generate security deposit billing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleBusCardGeneration = async () => {
    if (!busYear || !busMonth) {
      toast.error('Please enter year and month for bus card billing');
      return;
    }

    setIsGenerating('bus');
    try {
      const year = parseInt(busYear);
      const month = parseInt(busMonth);
      
      // Show the billing periods that will be generated
      const [w1, w2] = getBillingWindowsForMonth(year, month);
      const period1 = `${w1.start.toFormat('MMM dd')} - ${w1.end.toFormat('MMM dd')}`;
      const period2 = `${w2.start.toFormat('MMM dd')} - ${w2.end.toFormat('MMM dd, yyyy')}`;
      
      // Use bus card amounts from assignments instead of a fixed amount
      const count = await generateBusCardBillingForMonth(year, month);
      
      const result = { count, timestamp: new Date().toLocaleString() };
      setLastResults(prev => ({ ...prev, bus: result }));
      
      toast.success(`Generated ${count} bus card billing records for ${month}/${year} - Periods: ${period1} & ${period2} (using assignment amounts)`);
      onBillingGenerated?.(count, 'Bus Card');
    } catch (error) {
      console.error('Bus card billing generation error:', error);
      toast.error(`Failed to generate bus card billing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Housing Billing */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Home className="h-5 w-5" />
            Housing Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="housing-year">Year</Label>
              <Input
                id="housing-year"
                type="number"
                value={housingYear}
                onChange={(e) => setHousingYear(e.target.value)}
                disabled={isGenerating === 'housing'}
                min="2020"
                max="2030"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="housing-month">Month</Label>
              <Input
                id="housing-month"
                type="number"
                value={housingMonth}
                onChange={(e) => setHousingMonth(e.target.value)}
                disabled={isGenerating === 'housing'}
                min="1"
                max="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="housing-period">Billing Period</Label>
              <Select value={housingPeriod} onValueChange={setHousingPeriod} disabled={isGenerating === 'housing'}>
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

          {/* Show assignment data summary */}
          {housingAssignments.length > 0 && (
            <Alert className="bg-blue-500/20 border-blue-500/30">
              <AlertDescription className="text-xs">
                <strong>Found {housingAssignments.length} housing assignments</strong> with rent amounts from assignment table.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleHousingGeneration}
            disabled={isGenerating === 'housing'}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isGenerating === 'housing' ? (
              <>
                <Play className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Housing Billing
              </>
            )}
          </Button>

          {lastResults.housing && (
            <Alert className="bg-blue-500/20 border-blue-500/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last Generated:</strong> {lastResults.housing.timestamp}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-500/20 border-blue-500/30">
            <AlertDescription className="text-xs">
              <strong>Bi-weekly periods:</strong> 1st-15th & 16th-end of month. Uses assignment table data with rent amounts for staff with active assignments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Transportation Billing */}
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Bus className="h-5 w-5" />
            Transportation Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transport-year">Year</Label>
              <Input
                id="transport-year"
                type="number"
                value={transportYear}
                onChange={(e) => setTransportYear(e.target.value)}
                disabled={isGenerating === 'transportation'}
                min="2020"
                max="2030"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport-month">Month</Label>
              <Input
                id="transport-month"
                type="number"
                value={transportMonth}
                onChange={(e) => setTransportMonth(e.target.value)}
                disabled={isGenerating === 'transportation'}
                min="1"
                max="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport-period">Billing Period</Label>
              <Select value={transportPeriod} onValueChange={setTransportPeriod} disabled={isGenerating === 'transportation'}>
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


          {/* Show assignment data summary */}
          {transportAssignments.length > 0 && (
            <Alert className="bg-green-500/20 border-green-500/30">
              <AlertDescription className="text-xs">
                <strong>Found {transportAssignments.length} transportation assignments</strong> with transport amounts from assignment table.
                {transportAssignments.length > 0 && (
                  <span className="block mt-1">
                    Average amount: ${(transportAssignments.reduce((sum: number, a: any) => sum + (a.transport_amount || 0), 0) / transportAssignments.length).toFixed(2)} per period
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleTransportationGeneration}
            disabled={isGenerating === 'transportation'}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {isGenerating === 'transportation' ? (
              <>
                <Play className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Transportation Billing
              </>
            )}
          </Button>

          {lastResults.transportation && (
            <Alert className="bg-green-500/20 border-green-500/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last Generated:</strong> {lastResults.transportation.count} records at {lastResults.transportation.timestamp}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-green-500/20 border-green-500/30">
            <AlertDescription className="text-xs">
              <strong>Bi-weekly periods:</strong> 1st-15th & 16th-end of month. Uses transport_amount from assignment table for staff with transportation_agreement = true.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Security Deposit Billing */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Shield className="h-5 w-5" />
            Security Deposit Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="security-year">Year</Label>
              <Input
                id="security-year"
                type="number"
                value={securityYear}
                onChange={(e) => setSecurityYear(e.target.value)}
                disabled={isGenerating === 'security'}
                min="2020"
                max="2030"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-month">Month</Label>
              <Input
                id="security-month"
                type="number"
                value={securityMonth}
                onChange={(e) => setSecurityMonth(e.target.value)}
                disabled={isGenerating === 'security'}
                min="1"
                max="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-period">Billing Period</Label>
              <Select value={securityPeriod} onValueChange={setSecurityPeriod} disabled={isGenerating === 'security'}>
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


          {/* Show deduction data summary */}
          {securityDeductions.length > 0 && (
            <Alert className="bg-purple-500/20 border-purple-500/30">
              <AlertDescription className="text-xs">
                <strong>Found {securityDeductions.length} pending security deposit deductions</strong> totaling ${securityDeductions.reduce((sum: number, d: any) => sum + (d.scheduled_amount || 0), 0).toFixed(2)} from deductions table.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSecurityDepositGeneration}
            disabled={isGenerating === 'security'}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {isGenerating === 'security' ? (
              <>
                <Play className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Security Deposit Billing
              </>
            )}
          </Button>

          {lastResults.security && (
            <Alert className="bg-purple-500/20 border-purple-500/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last Generated:</strong> {lastResults.security.count} records at {lastResults.security.timestamp}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-purple-500/20 border-purple-500/30">
            <AlertDescription className="text-xs">
              <strong>Bi-weekly periods:</strong> 1st-15th & 16th-end of month. Uses pending deduction amounts from billing_deductions table until exhausted. Processes existing security deposit deductions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bus Card Billing */}
      <Card className="bg-orange-500/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <Plane className="h-5 w-5" />
            Bus Card Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bus-year">Year</Label>
              <Input
                id="bus-year"
                type="number"
                value={busYear}
                onChange={(e) => setBusYear(e.target.value)}
                disabled={isGenerating === 'bus'}
                min="2020"
                max="2030"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus-month">Month</Label>
              <Input
                id="bus-month"
                type="number"
                value={busMonth}
                onChange={(e) => setBusMonth(e.target.value)}
                disabled={isGenerating === 'bus'}
                min="1"
                max="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus-period">Billing Period</Label>
              <Select value={busPeriod} onValueChange={setBusPeriod} disabled={isGenerating === 'bus'}>
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


          {/* Show assignment data summary */}
          {busAssignments.length > 0 && (
            <Alert className="bg-orange-500/20 border-orange-500/30">
              <AlertDescription className="text-xs">
                <strong>Found {busAssignments.length} bus card assignments</strong> with bus card amounts from assignment table.
                {busAssignments.length > 0 && (
                  <span className="block mt-1">
                    Average amount: ${(busAssignments.reduce((sum: number, a: any) => sum + (a.bus_card_amount || 0), 0) / busAssignments.length).toFixed(2)} per period
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleBusCardGeneration}
            disabled={isGenerating === 'bus'}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {isGenerating === 'bus' ? (
              <>
                <Play className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Bus Card Billing
              </>
            )}
          </Button>

          {lastResults.bus && (
            <Alert className="bg-orange-500/20 border-orange-500/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last Generated:</strong> {lastResults.bus.count} records at {lastResults.bus.timestamp}
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-orange-500/20 border-orange-500/30">
            <AlertDescription className="text-xs">
              <strong>Bi-weekly periods:</strong> 1st-15th & 16th-end of month. Uses bus_card_amount from assignment table for staff with bus_card_agreement = true. Creates 1 deduction on 7th/22nd schedule.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      </div>

      {/* Flight Agreement Generator - Full Width */}
      <FlightAgreementGenerator onAgreementCreated={(count) => onBillingGenerated?.(count, 'Flight Agreement')} />
    </div>
  );
}
