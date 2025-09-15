import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, Clock, CheckCircle, AlertTriangle, XCircle, Shield, User, FileText, Home, Download } from 'lucide-react';
import { Assignment } from '@/integration/supabase/types/assignment';
import { FrontendSecurityDeposit } from '@/integration/supabase/types/security-deposit';
import { 
  getSecurityDepositsForAssignments, 
  createSecurityDeposit,
  updateDeductionStatus 
} from '@/integration/supabase/api/security-deposits';
import { format } from 'date-fns';
import { useAssignments } from '@/hooks/assignment/useAssignment';
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";
import { useToast } from "@/components/ui/use-toast";
import { EligibilityCheckForm } from './EligibilityCheckForm';

// Using types from security-deposit.ts
interface EligibilityCheck {
  isEligible: boolean;
  reasons: string[];
  recommendation: 'Full Refund' | 'Partial Refund' | 'No Refund';
  refundAmount: number;
}

interface RefundDecision {
  decision: 'Approved' | 'Denied' | 'Partial';
  amount: number;
  reasons: string[];
  approvedBy: string;
  approvedAt: string;
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export const SecurityDepositTab = () => {
  const { toast } = useToast();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { externalStaff, loading: staffLoading } = useExternalStaff();
  
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [depositData, setDepositData] = useState<FrontendSecurityDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<FrontendSecurityDeposit | null>(null);
  const [eligibilityCheck, setEligibilityCheck] = useState<EligibilityCheck | null>(null);
  const [refundDecision, setRefundDecision] = useState<RefundDecision | null>(null);
  const [isCreateDepositOpen, setIsCreateDepositOpen] = useState(false);
  const [isEligibilityCheckOpen, setIsEligibilityCheckOpen] = useState(false);
  const [isRefundDecisionOpen, setIsRefundDecisionOpen] = useState(false);
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);

  // Filter assignments that have active tenants
  const assignmentsWithTenants = assignments?.filter(assignment => 
    assignment.tenantId && assignment.status === 'Active'
  ) || [];

  // Load security deposit data from database
  useEffect(() => {
    const loadSecurityDeposits = async () => {
      if (!assignments || assignments.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const assignmentIds = assignments.map(a => a.id);
        console.log('SecurityDepositTab: Loading deposits for assignment IDs:', assignmentIds);
        const deposits = await getSecurityDepositsForAssignments(assignmentIds);
        console.log('SecurityDepositTab: Loaded deposits:', deposits);
        setDepositData(deposits);
      } catch (err) {
        console.error('SecurityDepositTab: Error loading deposits:', err);
        setError(err instanceof Error ? err.message : 'Failed to load security deposits');
      } finally {
        setLoading(false);
      }
    };
    
    loadSecurityDeposits();
  }, [assignments]);
  
  // Create security deposit for selected assignment if it doesn't exist
  const handleCreateSecurityDeposit = async (assignmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newDeposit = await createSecurityDeposit(assignmentId, 500, 'payroll_deduction');
      setDepositData(prev => [...prev, newDeposit]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create security deposit');
    } finally {
      setLoading(false);
    }
  };

  const runEligibilityCheck = (deposit: FrontendSecurityDeposit) => {
    // BOH Housing Rules Implementation with Real Data
    const assignment = assignments?.find(a => a.id === deposit.assignmentId);
    if (!assignment) return;

    // Get tenant's external staff record
    const tenant = externalStaff?.find(staff => staff.id === assignment.tenantId);
    
    const reasons: string[] = [];
    let isEligible = true;
    let refundAmount = deposit.totalAmount;

    // Check 1: Damage assessment (mock - would integrate with inspection system)
    const hasDamage = false; // Mock value
    if (hasDamage) {
      reasons.push("Property damage detected during inspection");
      isEligible = false;
    } else {
      reasons.push("✓ No property damage detected");
    }

    // Check 2: Cleaning condition (mock - would integrate with inspection system)
    const isCleanedProperly = true; // Mock value
    if (!isCleanedProperly) {
      reasons.push("Unit not cleaned to check-in condition");
      isEligible = false;
    } else {
      reasons.push("✓ Unit cleaned to check-in condition");
    }

    // Check 3: Personal items removed (mock - would integrate with inspection system)
    const personalItemsRemoved = true; // Mock value
    if (!personalItemsRemoved) {
      reasons.push("Personal items not fully removed from unit");
      isEligible = false;
    } else {
      reasons.push("✓ All personal items removed");
    }

    // Check 4: House rules compliance (mock - would integrate with violation tracking)
    const houseRulesFollowed = true; // Mock value
    if (!houseRulesFollowed) {
      reasons.push("House rules violations recorded");
      isEligible = false;
    } else {
      reasons.push("✓ All house rules followed");
    }

    // Check 5: Resided until agreed end date - Special logic for J1 staff
    const currentDate = new Date();
    const endDate = new Date(assignment.endDate);
    const leftEarly = currentDate < endDate;
    
    // Check if tenant is J1 staff
    const isJ1Staff = tenant?.["HOME DEPARTMENT"] === "J1STAF - J1 STAFF";
    
    if (leftEarly) {
      const daysDifference = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
      
      if (isJ1Staff) {
        // For J1 staff, check if they have a termination date (DS-2019 end date)
        const terminationDate = tenant?.["TERMINATION DATE"];
        if (terminationDate && terminationDate !== "") {
          const termDate = new Date(terminationDate);
          if (currentDate >= termDate) {
            reasons.push("✓ J1 staff - DS-2019 program ended, early departure authorized");
          } else {
            reasons.push(`J1 staff left ${daysDifference} days before DS-2019 end date - non-refundable per housing rules`);
            isEligible = false;
            refundAmount = 0;
          }
        } else {
          reasons.push(`J1 staff left ${daysDifference} days before agreed end date - non-refundable per housing rules`);
          isEligible = false;
          refundAmount = 0;
        }
      } else {
        reasons.push(`Left ${daysDifference} days before agreed end date - non-refundable per housing rules`);
        isEligible = false;
        refundAmount = 0;
      }
    } else {
      if (isJ1Staff) {
        reasons.push("✓ J1 staff - Resided until DS-2019 program end date");
      } else {
        reasons.push("✓ Resided until agreed-upon end date");
      }
    }

    // Check 6: Minimum residency requirement (6 months for long-term, different for J1)
    const startDate = new Date(assignment.startDate);
    const residencyDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    if (isJ1Staff) {
      // J1 staff have different minimum requirements based on their program duration
      const minimumDays = 90; // 3 months minimum for J1
      if (residencyDays < minimumDays) {
        reasons.push(`J1 staff residency period (${residencyDays} days) less than minimum 3 months requirement`);
        isEligible = false;
      } else {
        reasons.push(`✓ J1 staff - Met minimum residency requirement (${residencyDays} days)`);
      }
    } else {
      // Long-term staff minimum 6 months
      const minimumDays = 180; // 6 months
      if (residencyDays < minimumDays) {
        reasons.push(`Residency period (${residencyDays} days) less than minimum 6 months requirement`);
        isEligible = false;
      } else {
        reasons.push(`✓ Met minimum residency requirement (${residencyDays} days)`);
      }
    }

    // Check 7: Staff status (active vs terminated)
    if (tenant) {
      const terminationDate = tenant["TERMINATION DATE"];
      if (terminationDate && terminationDate !== "") {
        reasons.push(`✓ Staff properly terminated on ${format(new Date(terminationDate), 'MMM dd, yyyy')}`);
      } else {
        reasons.push("⚠️ Staff still active - early departure may require HR review");
      }
    }

    // Apply deductions
    const totalDeducted = deposit.deductions.reduce((sum, d) => sum + (d.actualAmount || 0), 0);
    const refundPercentage = (totalDeducted / deposit.totalAmount) * 100;
    if (deposit.totalAmount > 0) {
      refundAmount = Math.max(0, deposit.totalAmount - totalDeducted);
      reasons.push(`Deductions applied: $${totalDeducted}`);
    }

    const recommendation = isEligible 
      ? (refundAmount === deposit.totalAmount ? 'Full Refund' : 'Partial Refund')
      : 'No Refund';

    const eligibilityResult: EligibilityCheck = {
      isEligible,
      reasons,
      recommendation: recommendation as EligibilityCheck['recommendation'],
      refundAmount
    };

    setEligibilityCheck(eligibilityResult);
    setIsEligibilityCheckOpen(true);
  };

  const createRefundDecision = (eligibility: EligibilityCheck) => {
    const decision: RefundDecision = {
      decision: eligibility.isEligible ? 'Approved' : 'Denied',
      amount: eligibility.refundAmount,
      reasons: eligibility.reasons,
      approvedBy: "Current User", // Would get from auth context
      approvedAt: new Date().toISOString(),
      auditTrail: [
        {
          id: "audit_001",
          action: "Eligibility Check Performed",
          performedBy: "Current User",
          timestamp: new Date().toISOString(),
          details: `Automated eligibility check completed. Recommendation: ${eligibility.recommendation}`
        },
        {
          id: "audit_002",
          action: "Refund Decision Created",
          performedBy: "Current User",
          timestamp: new Date().toISOString(),
          details: `Decision: ${eligibility.isEligible ? 'Approved' : 'Denied'}, Amount: $${eligibility.refundAmount}`
        }
      ]
    };

    setRefundDecision(decision);
    setIsRefundDecisionOpen(true);
  };

  const exportAuditTrail = (decision: RefundDecision) => {
    const auditData = {
      depositId: selectedDeposit?.id,
      tenantName: selectedDeposit?.tenantName,
      decision: decision.decision,
      amount: decision.amount,
      reasons: decision.reasons,
      approvedBy: decision.approvedBy,
      approvedAt: decision.approvedAt,
      auditTrail: decision.auditTrail
    };

    const dataStr = JSON.stringify(auditData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security_deposit_audit_${selectedDeposit?.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Audit Trail Exported",
      description: "Security deposit audit trail has been downloaded",
    });
  };

  if (assignmentsWithTenants.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Active Tenants</h3>
        <p className="text-white/60">Security deposit management requires active tenant assignments.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Security Deposits</h2>
          <p className="text-white/60">Manage tenant security deposits and refund decisions</p>
        </div>
      </div>

      {/* Tenant Selection */}
      <Card className="bg-black/40 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Tenant Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an assignment" />
            </SelectTrigger>
            <SelectContent>
              {assignmentsWithTenants.map((assignment) => {
                const hasDeposit = depositData.some(d => d.assignmentId === assignment.id);
                return (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.tenantName} - {assignment.propertyName}
                    {!hasDeposit && ' (No deposit created)'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Deposit Records */}
      {selectedAssignment && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Information */}
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Deposit Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const selectedDeposit = depositData.find(d => d.assignmentId === selectedAssignment);
                console.log('SecurityDepositTab: Selected assignment:', selectedAssignment);
                console.log('SecurityDepositTab: Available deposit data:', depositData);
                console.log('SecurityDepositTab: Found deposit for assignment:', selectedDeposit);
                return !selectedDeposit ? (
                  <div className="text-center py-8">
                    <p className="text-white/60 mb-4">No deposit record found</p>
                    <Button onClick={() => handleCreateSecurityDeposit(selectedAssignment)}>
                      Create Deposit Record
                    </Button>
                  </div>
                ) : (
                  <div key={selectedDeposit.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Status</span>
                      <Badge variant={selectedDeposit.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                        {selectedDeposit.paymentStatus.charAt(0).toUpperCase() + selectedDeposit.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Deposit Amount</span>
                      <span className="font-medium">${selectedDeposit.totalAmount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Deductions</span>
                      <span className="font-semibold text-red-400">${selectedDeposit.deductions.reduce((sum, d) => sum + d.amount, 0)}</span>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">Payroll Deductions</h4>
                      <div className="space-y-2">
                        {selectedDeposit.deductions.map((deduction) => (
                          <div key={deduction.id} className="flex items-center justify-between text-sm">
                            <span>{format(new Date(deduction.scheduledDate), 'MMM dd, yyyy')}</span>
                            <div className="flex items-center gap-2">
                              <span>${deduction.amount}</span>
                              <Badge 
                                variant={deduction.status === 'deducted' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {deduction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => {
                          setSelectedDeposit(selectedDeposit);
                          setShowEligibilityForm(true);
                        }}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Run Eligibility Check
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* BOH Housing Rules Reference */}
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                BOH Housing Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Security deposit required and auto-deducted from first four paychecks</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Full refund if: no damage, unit cleaned, personal items removed, house rules followed</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>Must reside until agreed end date - early departure = non-refundable</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>J1 staff: DS-2019 end date = program end; Long-term: minimum 6 months</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <Home className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Company relocations do not affect deposit eligibility</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Early departure requests require HR review</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Eligibility Check Dialog */}
      <Dialog open={isEligibilityCheckOpen} onOpenChange={setIsEligibilityCheckOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Eligibility Check Results
            </DialogTitle>
          </DialogHeader>
          {eligibilityCheck && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h3 className="font-semibold">Recommendation</h3>
                  <p className="text-sm text-muted-foreground">{eligibilityCheck.recommendation}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${eligibilityCheck.refundAmount}</p>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Assessment Details</h4>
                {eligibilityCheck.reasons.map((reason, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    {reason.startsWith('✓') ? (
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{reason.replace('✓ ', '')}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => createRefundDecision(eligibilityCheck)}
                  className="flex-1"
                >
                  Create Refund Decision
                </Button>
                <Button variant="outline" onClick={() => setIsEligibilityCheckOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Decision Dialog */}
      <Dialog open={isRefundDecisionOpen} onOpenChange={setIsRefundDecisionOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Refund Decision & Audit Trail
            </DialogTitle>
          </DialogHeader>
          {refundDecision && (
            <div className="space-y-6">
              {/* Decision Summary */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Decision</h3>
                    <Badge variant={refundDecision.decision === 'Approved' ? 'default' : 'destructive'}>
                      {refundDecision.decision}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold">Refund Amount</h3>
                    <p className="text-2xl font-bold">${refundDecision.amount}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Approved By</h3>
                    <p className="text-sm">{refundDecision.approvedBy}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Approved At</h3>
                    <p className="text-sm">{format(new Date(refundDecision.approvedAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div>
                <h4 className="font-medium mb-3">Audit Trail</h4>
                <div className="space-y-3">
                  {refundDecision.auditTrail.map((entry) => (
                    <div key={entry.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{entry.action}</h5>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.details}</p>
                        <p className="text-xs text-muted-foreground">by {entry.performedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => exportAuditTrail(refundDecision)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Audit Trail
                </Button>
                <Button variant="outline" onClick={() => setIsRefundDecisionOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Eligibility Assessment Form */}
      {showEligibilityForm && selectedDeposit && (
        <Dialog open={showEligibilityForm} onOpenChange={setShowEligibilityForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Security Deposit Eligibility Assessment</DialogTitle>
            </DialogHeader>
            <EligibilityCheckForm
              deposit={selectedDeposit}
              assignment={assignments?.find(a => a.id === selectedDeposit.assignmentId) as any}
              onComplete={(assessment, result) => {
                setEligibilityCheck({
                  isEligible: result.isEligible,
                  reasons: result.reasons,
                  recommendation: result.refundRecommendation,
                  refundAmount: result.refundAmount
                });
                setShowEligibilityForm(false);
                setIsEligibilityCheckOpen(true);
                toast({
                  title: "Assessment Complete",
                  description: `Refund recommendation: ${result.refundRecommendation} - $${result.refundAmount}`,
                });
              }}
              onCancel={() => setShowEligibilityForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
