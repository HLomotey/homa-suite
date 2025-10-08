import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, DollarSign, Clock, CheckCircle, AlertTriangle, XCircle, Plane, User, FileText, Home, Download } from 'lucide-react';
import { format, addMonths, setDate } from 'date-fns';
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { useToast } from "@/components/ui/use-toast";
import { useFlightAgreements } from "@/hooks/flight-agreements/useFlightAgreements";
import { CreateFlightAgreementData, CreateDeductionData, FlightAgreementSummary } from "@/integration/supabase/api/flight-agreements";

// Flight Agreement interfaces
interface FlightAgreement {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  agreementAmount: number;
  deductionAmount: number;
  startDate: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  payrollDeductions: PayrollDeduction[];
  createdAt: string;
  createdBy: string;
}

interface PayrollDeduction {
  id: string;
  agreementId: string;
  payrollPeriod: string;
  deductionDate: string;
  amount: number;
  status: 'Pending' | 'Processed' | 'Failed';
  processedAt?: string;
  notes?: string;
}

interface FlightEligibleStaff {
  id: string;
  name: string;
  department: string;
  jobTitle: string;
  email: string;
  flightBenefit: boolean;
}

function FlightAgreementTab() {
  const { toast } = useToast();
  const { externalStaff, loading: staffLoading } = useExternalStaff();
  const { 
    agreements, 
    loading, 
    error, 
    createAgreement, 
    cancelAgreement,
    refetch 
  } = useFlightAgreements();

  const [eligibleStaff, setEligibleStaff] = useState<FlightEligibleStaff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [flightAgreementChecked, setFlightAgreementChecked] = useState(false);
  const [agreementAmount, setAgreementAmount] = useState<string>('');
  const [deductionSchedule, setDeductionSchedule] = useState<PayrollDeduction[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<FlightAgreementSummary | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Filter staff who have opted into flight benefits
  useEffect(() => {
    if (externalStaff) {
      const flightEligible = externalStaff
        .filter(staff => {
          // Filter for active staff who have opted into flight benefits
          const isActive = !staff["TERMINATION DATE"];
          // Assuming there's a field for flight benefit opt-in - adjust field name as needed
          const hasFlightBenefit = staff["FLIGHT_BENEFIT"] === 'Yes' || 
                                 staff["FLIGHT BENEFIT"] === 'Yes' ||
                                 staff["Flight Benefit"] === 'Yes';
          return isActive && hasFlightBenefit;
        })
        .map(staff => ({
          id: staff["ASSOCIATE ID"] || staff.id,
          name: `${staff["PAYROLL FIRST NAME"] || staff["FIRST NAME"] || ''} ${staff["PAYROLL LAST NAME"] || staff["LAST NAME"] || ''}`.trim(),
          department: staff["HOME DEPARTMENT"] || staff["DEPARTMENT"] || 'N/A',
          jobTitle: staff["JOB TITLE"] || 'N/A',
          email: staff["WORK E-MAIL"] || staff["PERSONAL E-MAIL"] || 'N/A',
          flightBenefit: true
        }));
      
      setEligibleStaff(flightEligible);
    }
  }, [externalStaff]);

  // Generate payroll deduction schedule for 3 periods (7th and 22nd of each month)
  const generateFlightDeductionSchedule = (totalAmount: number, startDate: Date = new Date()) => {
    if (totalAmount <= 0) return [];
    
    const deductionAmount = Math.round((totalAmount / 3) * 100) / 100; // Round to 2 decimal places
    const deductions: PayrollDeduction[] = [];
    
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < 3; i++) {
      // Determine if we should use 7th or 22nd based on current date
      let deductionDate: Date;
      
      if (i === 0) {
        // First deduction: next available payroll date
        if (currentDate.getDate() <= 7) {
          deductionDate = setDate(currentDate, 7);
        } else if (currentDate.getDate() <= 22) {
          deductionDate = setDate(currentDate, 22);
        } else {
          deductionDate = setDate(addMonths(currentDate, 1), 7);
        }
      } else {
        // Subsequent deductions: alternate between 7th and 22nd
        const prevDate = deductions[i - 1].deductionDate;
        const prevDay = new Date(prevDate).getDate();
        
        if (prevDay === 7) {
          deductionDate = setDate(new Date(prevDate), 22);
        } else {
          deductionDate = setDate(addMonths(new Date(prevDate), 1), 7);
        }
      }
      
      deductions.push({
        id: `temp-${i}`,
        agreementId: 'temp',
        deductionDate: deductionDate.toISOString().split('T')[0],
        amount: deductionAmount,
        status: 'Pending',
        payrollPeriod: format(deductionDate, 'MMM yyyy'),
        notes: `Flight agreement deduction ${i + 1} of 3`
      });
    }
    
    return deductions;
  };

  const handleCreateAgreement = async () => {
    if (!selectedStaffId || !agreementAmount) {
      toast({
        title: "Error",
        description: "Please select a staff member and enter an agreement amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedStaff = eligibleStaff.find(staff => staff.id === selectedStaffId);
    if (!selectedStaff) {
      toast({
        title: "Error",
        description: "Selected staff member not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(agreementAmount);
      const deductionAmount = Math.round((amount / 3) * 100) / 100;
      
      // Generate deduction schedule (3 payroll periods)
      const deductions = generateFlightDeductionSchedule(amount);
      
      const agreementData: CreateFlightAgreementData = {
        staff_id: selectedStaffId,
        staff_name: selectedStaff.name,
        department: selectedStaff.department,
        job_title: selectedStaff.jobTitle,
        agreement_amount: amount,
        deduction_amount: deductionAmount,
        total_deductions: 3,
        start_date: new Date().toISOString(),
        notes: `Flight agreement for ${selectedStaff.name}`
      };

      const deductionsData: CreateDeductionData[] = deductions.map((deduction, index) => ({
        agreement_id: '', // Will be set by the hook
        deduction_sequence: index + 1,
        scheduled_date: deduction.deductionDate,
        deduction_date: deduction.deductionDate,
        scheduled_amount: deduction.amount,
        payroll_period: deduction.payrollPeriod,
        status: 'pending' as any
      }));

      await createAgreement(agreementData, deductionsData);
      
      toast({
        title: "Success",
        description: `Flight agreement created for ${selectedStaff.name}`,
      });
      
      // Reset form
      setSelectedStaffId('');
      setAgreementAmount('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flight agreement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'default',
      'Completed': 'secondary',
      'Cancelled': 'destructive',
      'Pending': 'outline',
      'Processed': 'secondary',
      'Failed': 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const handleViewDetails = (agreement: FlightAgreementSummary) => {
    setSelectedAgreement(agreement);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Flight Purchase Agreements
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Manage flight purchase agreements with automatic payroll deductions
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={eligibleStaff.length === 0}
        >
          <Plane className="h-4 w-4 mr-2" />
          Create Agreement
        </Button>
      </div>

      {eligibleStaff.length === 0 && !staffLoading && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No staff members are eligible for flight agreements. Staff must opt into flight benefits to be eligible.
          </AlertDescription>
        </Alert>
      )}

      {/* Agreements Table */}
      <Card className="bg-black/40 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Active Flight Agreements</CardTitle>
          <CardDescription className="text-white/60">
            Current flight purchase agreements and their deduction schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agreements.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No flight agreements found. Create your first agreement to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Staff Member</TableHead>
                  <TableHead className="text-white">Department</TableHead>
                  <TableHead className="text-white">Agreement Amount</TableHead>
                  <TableHead className="text-white">Deduction Amount</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Start Date</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map((agreement) => (
                  <TableRow key={agreement.id}>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {agreement.staff_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80">{agreement.department}</TableCell>
                    <TableCell className="text-white/80">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {agreement.agreement_amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {agreement.deduction_amount.toFixed(2)} × 3
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(agreement.status)}</TableCell>
                    <TableCell className="text-white/80">
                      {format(new Date(agreement.start_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(agreement)}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Agreement Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Plane className="h-5 w-5" />
              Create Flight Agreement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Staff Selection */}
            <div>
              <Label htmlFor="staff-select" className="text-white/80">Staff Member</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {eligibleStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id} className="text-white hover:bg-gray-600">
                      <div className="flex flex-col">
                        <span>{staff.name}</span>
                        <span className="text-xs text-gray-400">{staff.department} - {staff.jobTitle}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Flight Agreement Checkbox */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
                <Checkbox
                  id="flight_agreement"
                  checked={flightAgreementChecked}
                  onCheckedChange={(checked) => setFlightAgreementChecked(checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-purple-600" />
                  <div>
                    <Label
                      htmlFor="flight_agreement"
                      className="text-sm font-medium cursor-pointer text-white"
                    >
                      Flight Agreement
                    </Label>
                    <p className="text-xs text-gray-400">
                      Agree to flight benefit terms and conditions
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement Status Indicator */}
              {flightAgreementChecked && (
                <div className="p-2 bg-green-800/20 border border-green-600/30 rounded-md">
                  <p className="text-xs text-green-300">
                    ✓ Flight Agreement confirmed
                  </p>
                </div>
              )}
            </div>

            {/* Flight Agreement Amount */}
            {flightAgreementChecked && (
              <div className="space-y-4 p-4 border border-purple-600/30 rounded-lg bg-purple-900/10">
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-white">
                    Flight Agreement Amount
                  </h3>
                </div>
                <p className="text-xs text-gray-300 mb-4">
                  Enter the flight agreement amount details.
                </p>
                
                <div>
                  <Label className="text-sm font-medium text-white">
                    Agreement Amount ($) *
                  </Label>
                  <Input
                    type="number"
                    value={agreementAmount}
                    onChange={(e) => setAgreementAmount(e.target.value)}
                    className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    min={0}
                    step="0.01"
                    placeholder="Enter agreement amount"
                  />
                </div>

                {/* Deduction Schedule Preview */}
                {deductionSchedule.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-3 text-white">
                      Payroll Deduction Schedule (3 periods)
                    </h4>
                    <div className="bg-gray-700/50 rounded-md p-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-white text-xs">Date</TableHead>
                            <TableHead className="text-white text-xs">Amount</TableHead>
                            <TableHead className="text-white text-xs">Period</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deductionSchedule.map((deduction, index) => (
                            <TableRow key={deduction.id}>
                              <TableCell className="text-white text-xs">
                                {format(new Date(deduction.deductionDate), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell className="text-white text-xs">
                                ${deduction.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-white text-xs">
                                {deduction.payrollPeriod}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-2 text-xs text-gray-300">
                      <p>• Deductions will be automatically processed on the 7th and 22nd of each month</p>
                      <p>• Each deduction: ${agreementAmount ? (parseFloat(agreementAmount) / 3).toFixed(2) : '0.00'}</p>
                      <p>• Total recovery period: 3 payroll periods</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreateAgreement} 
                disabled={loading || !selectedStaffId || !flightAgreementChecked || !agreementAmount}
                className="flex-1"
              >
                Create Agreement
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFlightAgreementChecked(false);
                  setAgreementAmount('');
                  setDeductionSchedule([]);
                }}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agreement Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="bg-gray-900 border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Flight Agreement Details
            </DialogTitle>
          </DialogHeader>
          {selectedAgreement && (
            <div className="space-y-6">
              {/* Agreement Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60">Staff Member</Label>
                  <p className="text-white font-medium">{selectedAgreement.staff_name}</p>
                </div>
                <div>
                  <Label className="text-white/60">Department</Label>
                  <p className="text-white">{selectedAgreement.department}</p>
                </div>
                <div>
                  <Label className="text-white/60">Agreement Amount</Label>
                  <p className="text-white font-medium">${selectedAgreement.agreement_amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-white/60">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAgreement.status)}</div>
                </div>
              </div>

              {/* Deduction Summary */}
              <div>
                <h4 className="text-white font-medium mb-3">Deduction Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/60">Total Deductions</Label>
                    <p className="text-white font-medium">{selectedAgreement.total_deductions}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Deduction Amount</Label>
                    <p className="text-white font-medium">${selectedAgreement.deduction_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Total Deducted</Label>
                    <p className="text-white font-medium">${selectedAgreement.total_deducted.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Remaining Balance</Label>
                    <p className="text-white font-medium">${selectedAgreement.remaining_balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Pending Deductions</Label>
                    <p className="text-white font-medium">{selectedAgreement.pending_deductions}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Failed Deductions</Label>
                    <p className="text-white font-medium">{selectedAgreement.failed_deductions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FlightAgreementTab;
export { FlightAgreementTab };
