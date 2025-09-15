import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, DollarSign, FileText, User, Calendar, Mail, Download, Shield, Home } from 'lucide-react';
import { FrontendSecurityDeposit } from '@/integration/supabase/types/security-deposit';
import { Assignment, FrontendAssignment } from '@/integration/supabase/types/assignment';
import { createRefundDecision, updateRefundDecision } from '@/integration/supabase/api/refund-decisions';
import { PDFReportService } from '@/services/PDFReportService';
import { EmailService } from '@/services/EmailService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays, parseISO } from 'date-fns';

interface EligibilityAssessment {
  // Property condition checks
  propertyDamage: {
    hasDamage: boolean;
    damageDescription: string;
    estimatedCost: number;
  };
  
  // Cleaning assessment
  cleaningStatus: {
    isCleanedProperly: boolean;
    cleaningIssues: string[];
    requiresProfessionalCleaning: boolean;
  };
  
  // Personal items
  personalItems: {
    allItemsRemoved: boolean;
    itemsLeftBehind: string[];
    disposalRequired: boolean;
  };
  
  // House rules compliance
  houseRules: {
    rulesFollowed: boolean;
    violations: string[];
    violationDates: string[];
  };
  
  // Residency requirements
  residencyCompliance: {
    stayedUntilEndDate: boolean;
    actualDepartureDate: string;
    earlyDepartureReason: string;
    hrReviewRequired: boolean;
  };
  
  // Program compliance (J1 specific)
  programCompliance: {
    isJ1Staff: boolean;
    ds2019EndDate: string;
    programEndDate: string;
    companyRelocation: boolean;
  };
  
  // Additional notes
  additionalNotes: string;
  inspectedBy: string;
  inspectionDate: string;
}

interface EligibilityResult {
  isEligible: boolean;
  refundRecommendation: 'Full Refund' | 'Partial Refund' | 'No Refund';
  refundAmount: number;
  deductions: Array<{
    reason: string;
    amount: number;
  }>;
  reasons: string[];
  requiresHRReview: boolean;
}

interface EligibilityCheckFormProps {
  deposit: FrontendSecurityDeposit;
  assignment: FrontendAssignment;
  onComplete: (assessment: EligibilityAssessment, result: EligibilityResult) => void;
  onCancel: () => void;
}

export const EligibilityCheckForm: React.FC<EligibilityCheckFormProps> = ({
  deposit,
  assignment,
  onComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [assessment, setAssessment] = useState<EligibilityAssessment>({
    propertyDamage: {
      hasDamage: false,
      damageDescription: '',
      estimatedCost: 0
    },
    cleaningStatus: {
      isCleanedProperly: true,
      cleaningIssues: [],
      requiresProfessionalCleaning: false
    },
    personalItems: {
      allItemsRemoved: true,
      itemsLeftBehind: [],
      disposalRequired: false
    },
    houseRules: {
      rulesFollowed: true,
      violations: [],
      violationDates: []
    },
    residencyCompliance: {
      stayedUntilEndDate: true,
      actualDepartureDate: new Date().toISOString().split('T')[0],
      earlyDepartureReason: '',
      hrReviewRequired: false
    },
    programCompliance: {
      isJ1Staff: false,
      ds2019EndDate: '',
      programEndDate: '',
      companyRelocation: false
    },
    additionalNotes: '',
    inspectedBy: '',
    inspectionDate: new Date().toISOString().split('T')[0]
  });

  const calculateEligibility = (): EligibilityResult => {
    const deductions: Array<{ reason: string; amount: number }> = [];
    const reasons: string[] = [];
    let isEligible = true;

    // Check property damage
    if (assessment.propertyDamage.hasDamage) {
      const damageAmount = Math.min(assessment.propertyDamage.estimatedCost, deposit.totalAmount);
      deductions.push({
        reason: 'Property damage',
        amount: damageAmount
      });
      reasons.push(`Property damage: ${assessment.propertyDamage.damageDescription} ($${damageAmount})`);
      isEligible = false;
    } else {
      reasons.push('✓ No property damage detected');
    }

    // Check cleaning
    if (!assessment.cleaningStatus.isCleanedProperly) {
      const cleaningCost = assessment.cleaningStatus.requiresProfessionalCleaning ? 150 : 75;
      deductions.push({
        reason: 'Cleaning required',
        amount: cleaningCost
      });
      reasons.push(`Unit not cleaned properly (${assessment.cleaningStatus.cleaningIssues.join(', ')}) - $${cleaningCost}`);
      isEligible = false;
    } else {
      reasons.push('✓ Unit cleaned to check-in condition');
    }

    // Check personal items
    if (!assessment.personalItems.allItemsRemoved) {
      const disposalCost = assessment.personalItems.disposalRequired ? 100 : 50;
      deductions.push({
        reason: 'Item disposal',
        amount: disposalCost
      });
      reasons.push(`Personal items left behind (${assessment.personalItems.itemsLeftBehind.join(', ')}) - $${disposalCost}`);
      isEligible = false;
    } else {
      reasons.push('✓ All personal items removed');
    }

    // Check house rules
    if (!assessment.houseRules.rulesFollowed) {
      const violationPenalty = assessment.houseRules.violations.length * 25;
      deductions.push({
        reason: 'House rules violations',
        amount: violationPenalty
      });
      reasons.push(`House rules violations: ${assessment.houseRules.violations.join(', ')} - $${violationPenalty}`);
      isEligible = false;
    } else {
      reasons.push('✓ House rules followed');
    }

    // Check residency compliance
    if (!assessment.residencyCompliance.stayedUntilEndDate) {
      if (!assessment.programCompliance.companyRelocation) {
        reasons.push('❌ Early departure - deposit non-refundable');
        isEligible = false;
        // Early departure = full forfeiture unless company relocation
        deductions.push({
          reason: 'Early departure',
          amount: deposit.totalAmount
        });
      } else {
        reasons.push('✓ Company relocation - early departure excused');
      }
    } else {
      reasons.push('✓ Stayed until agreed end date');
    }

    // Calculate total deductions
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const refundAmount = Math.max(0, deposit.totalAmount - totalDeductions);

    // Determine refund recommendation
    let refundRecommendation: 'Full Refund' | 'Partial Refund' | 'No Refund';
    if (refundAmount === deposit.totalAmount) {
      refundRecommendation = 'Full Refund';
    } else if (refundAmount > 0) {
      refundRecommendation = 'Partial Refund';
    } else {
      refundRecommendation = 'No Refund';
    }

    // Check if HR review is required
    const requiresHRReview = 
      assessment.residencyCompliance.hrReviewRequired ||
      (!assessment.residencyCompliance.stayedUntilEndDate && assessment.residencyCompliance.earlyDepartureReason !== '') ||
      totalDeductions > 200;

    return {
      isEligible,
      refundRecommendation,
      refundAmount,
      deductions,
      reasons,
      requiresHRReview
    };
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Calculate eligibility result
      const result = calculateEligibility();
      
      // Save decision to database
      const { data: refundDecision, error: saveError } = await createRefundDecision({
        security_deposit_id: deposit.id,
        assessment_data: assessment,
        result: result,
        approved_by: currentUser?.user?.id || null
      });

      if (saveError || !refundDecision) {
        throw new Error(saveError || 'Failed to save refund decision');
      }

      toast({
        title: "Assessment Saved",
        description: "Refund decision has been recorded in the database.",
      });

      // Generate PDF report
      const { pdfBlob, filename } = await PDFReportService.generateRefundReport(
        deposit,
        assignment,
        refundDecision,
        currentUser?.externalStaff?.full_name || currentUser?.profile?.full_name || 'System User'
      );

      // Update decision with PDF info
      const pdfPath = `reports/${filename}`;
      await updateRefundDecision(refundDecision.id, {
        pdf_report_generated: true,
        pdf_report_path: pdfPath
      });

      toast({
        title: "PDF Generated",
        description: "Assessment report has been generated successfully.",
      });

      // Send email notification
      const recipients = [
        'tenant@example.com', // TODO: Get actual tenant email from assignment or external_staff
        'housing@bohhousing.com'
      ];

      const emailResult = await EmailService.sendRefundDecisionEmail(
        {
          refund_decision_id: refundDecision.id,
          recipients,
          pdf_path: pdfPath,
          tenant_name: assignment.tenantName || 'Unknown',
          property_name: assignment.propertyName || 'Unknown',
          refund_amount: result.refundAmount,
          decision_type: result.refundRecommendation
        },
        pdfBlob,
        filename
      );

      if (emailResult.success) {
        // Update decision with email info
        await updateRefundDecision(refundDecision.id, {
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          email_recipients: recipients
        });

        toast({
          title: "Email Sent",
          description: `Assessment report sent to ${recipients.length} recipients.`,
        });
      } else {
        toast({
          title: "Email Failed",
          description: emailResult.error || "Failed to send email notification.",
          variant: "destructive"
        });
      }

      // Send HR notification if required
      if (result.requiresHRReview) {
        await EmailService.sendHRReviewNotification(
          refundDecision.id,
          assignment.tenantName || 'Unknown',
          assignment.propertyName || 'Unknown',
          ['hr@bohhousing.com']
        );

        toast({
          title: "HR Notified",
          description: "HR team has been notified for review.",
        });
      }

      // Complete the workflow
      onComplete(assessment, result);

    } catch (error) {
      console.error('Error processing assessment:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const result = calculateEligibility();

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Deposit Eligibility Assessment
          </CardTitle>
          <CardDescription>
            Complete this assessment to determine refund eligibility based on BOH Housing rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Damage Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Condition
            </h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDamage"
                checked={assessment.propertyDamage.hasDamage}
                onCheckedChange={(checked) =>
                  setAssessment(prev => ({
                    ...prev,
                    propertyDamage: { ...prev.propertyDamage, hasDamage: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="hasDamage">Property damage detected</Label>
            </div>

            {assessment.propertyDamage.hasDamage && (
              <div className="space-y-2 ml-6">
                <Textarea
                  placeholder="Describe the damage..."
                  value={assessment.propertyDamage.damageDescription}
                  onChange={(e) =>
                    setAssessment(prev => ({
                      ...prev,
                      propertyDamage: { ...prev.propertyDamage, damageDescription: e.target.value }
                    }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Estimated repair cost"
                  value={assessment.propertyDamage.estimatedCost}
                  onChange={(e) =>
                    setAssessment(prev => ({
                      ...prev,
                      propertyDamage: { ...prev.propertyDamage, estimatedCost: Number(e.target.value) }
                    }))
                  }
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Cleaning Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cleaning Status</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCleanedProperly"
                checked={assessment.cleaningStatus.isCleanedProperly}
                onCheckedChange={(checked) =>
                  setAssessment(prev => ({
                    ...prev,
                    cleaningStatus: { ...prev.cleaningStatus, isCleanedProperly: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="isCleanedProperly">Unit cleaned to check-in condition</Label>
            </div>

            {!assessment.cleaningStatus.isCleanedProperly && (
              <div className="space-y-2 ml-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresProfessionalCleaning"
                    checked={assessment.cleaningStatus.requiresProfessionalCleaning}
                    onCheckedChange={(checked) =>
                      setAssessment(prev => ({
                        ...prev,
                        cleaningStatus: { ...prev.cleaningStatus, requiresProfessionalCleaning: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="requiresProfessionalCleaning">Requires professional cleaning</Label>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Personal Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Items</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allItemsRemoved"
                checked={assessment.personalItems.allItemsRemoved}
                onCheckedChange={(checked) =>
                  setAssessment(prev => ({
                    ...prev,
                    personalItems: { ...prev.personalItems, allItemsRemoved: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="allItemsRemoved">All personal items removed</Label>
            </div>

            {!assessment.personalItems.allItemsRemoved && (
              <div className="space-y-2 ml-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disposalRequired"
                    checked={assessment.personalItems.disposalRequired}
                    onCheckedChange={(checked) =>
                      setAssessment(prev => ({
                        ...prev,
                        personalItems: { ...prev.personalItems, disposalRequired: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="disposalRequired">Professional disposal required</Label>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* House Rules Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">House Rules Compliance</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rulesFollowed"
                checked={assessment.houseRules.rulesFollowed}
                onCheckedChange={(checked) =>
                  setAssessment(prev => ({
                    ...prev,
                    houseRules: { ...prev.houseRules, rulesFollowed: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="rulesFollowed">House rules followed throughout stay</Label>
            </div>
          </div>

          <Separator />

          {/* Residency Compliance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Residency Compliance
            </h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stayedUntilEndDate"
                checked={assessment.residencyCompliance.stayedUntilEndDate}
                onCheckedChange={(checked) =>
                  setAssessment(prev => ({
                    ...prev,
                    residencyCompliance: { ...prev.residencyCompliance, stayedUntilEndDate: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="stayedUntilEndDate">Stayed until agreed end date</Label>
            </div>

            {!assessment.residencyCompliance.stayedUntilEndDate && (
              <div className="space-y-2 ml-6">
                <Input
                  type="date"
                  placeholder="Actual departure date"
                  value={assessment.residencyCompliance.actualDepartureDate}
                  onChange={(e) =>
                    setAssessment(prev => ({
                      ...prev,
                      residencyCompliance: { ...prev.residencyCompliance, actualDepartureDate: e.target.value }
                    }))
                  }
                />
                <Textarea
                  placeholder="Reason for early departure..."
                  value={assessment.residencyCompliance.earlyDepartureReason}
                  onChange={(e) =>
                    setAssessment(prev => ({
                      ...prev,
                      residencyCompliance: { ...prev.residencyCompliance, earlyDepartureReason: e.target.value }
                    }))
                  }
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="companyRelocation"
                    checked={assessment.programCompliance.companyRelocation}
                    onCheckedChange={(checked) =>
                      setAssessment(prev => ({
                        ...prev,
                        programCompliance: { ...prev.programCompliance, companyRelocation: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="companyRelocation">Company-initiated relocation</Label>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Inspector Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Inspector Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Inspected by"
                value={assessment.inspectedBy}
                onChange={(e) =>
                  setAssessment(prev => ({ ...prev, inspectedBy: e.target.value }))
                }
              />
              <Input
                type="date"
                value={assessment.inspectionDate}
                onChange={(e) =>
                  setAssessment(prev => ({ ...prev, inspectionDate: e.target.value }))
                }
              />
            </div>

            <Textarea
              placeholder="Additional notes..."
              value={assessment.additionalNotes}
              onChange={(e) =>
                setAssessment(prev => ({ ...prev, additionalNotes: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment Result Preview */}
      <Card className="bg-black/40 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assessment Result Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Refund Recommendation:</span>
            <Badge variant={result.refundRecommendation === 'Full Refund' ? 'default' : 
                          result.refundRecommendation === 'Partial Refund' ? 'secondary' : 'destructive'}>
              {result.refundRecommendation}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Refund Amount:</span>
            <span className="font-semibold text-green-400">${result.refundAmount}</span>
          </div>

          {result.deductions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Deductions:</h4>
              <div className="space-y-1">
                {result.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{deduction.reason}</span>
                    <span className="text-red-400">-${deduction.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.requiresHRReview && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400">HR Review Required</span>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Assessment Summary:</h4>
            <div className="space-y-1 text-sm">
              {result.reasons.map((reason, index) => (
                <div key={index} className={reason.startsWith('✓') ? 'text-green-400' : 'text-red-400'}>
                  {reason}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSubmit} 
          className="flex-1" 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Assessment
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
