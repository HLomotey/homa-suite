/**
 * Refund Decision types for security deposit eligibility assessments
 */

export interface RefundDecision {
  id: string;
  security_deposit_id: string;
  decision_type: 'Approved' | 'Denied' | 'Partial';
  refund_amount: number;
  total_deductions: number;
  assessment_data: EligibilityAssessmentData;
  approved_by: string | null;
  approved_at: string;
  requires_hr_review: boolean;
  hr_reviewed_by: string | null;
  hr_reviewed_at: string | null;
  pdf_report_generated: boolean;
  pdf_report_path: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  email_recipients: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface AuditTrailEntry {
  id: string;
  security_deposit_id: string;
  refund_decision_id: string | null;
  action_type: string;
  action_description: string;
  action_data: Record<string, any> | null;
  performed_by: string | null;
  performed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EligibilityAssessmentData {
  propertyDamage: {
    hasDamage: boolean;
    damageDescription: string;
    estimatedCost: number;
  };
  cleaningStatus: {
    isCleanedProperly: boolean;
    cleaningIssues: string[];
    requiresProfessionalCleaning: boolean;
  };
  personalItems: {
    allItemsRemoved: boolean;
    itemsLeftBehind: string[];
    disposalRequired: boolean;
  };
  houseRules: {
    rulesFollowed: boolean;
    violations: string[];
    violationDates: string[];
  };
  residencyCompliance: {
    stayedUntilEndDate: boolean;
    actualDepartureDate: string;
    earlyDepartureReason: string;
    hrReviewRequired: boolean;
  };
  programCompliance: {
    isJ1Staff: boolean;
    ds2019EndDate: string;
    programEndDate: string;
    companyRelocation: boolean;
  };
  additionalNotes: string;
  inspectedBy: string;
  inspectionDate: string;
}

export interface RefundDecisionResult {
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

export interface CreateRefundDecisionRequest {
  security_deposit_id: string;
  assessment_data: EligibilityAssessmentData;
  result: RefundDecisionResult;
  approved_by: string;
}

export interface PDFReportData {
  deposit: {
    id: string;
    assignmentId: string;
    tenantName: string;
    totalAmount: number;
    paymentStatus: string;
  };
  assignment: {
    propertyName: string;
    roomName: string;
    startDate: string;
    endDate: string;
  };
  decision: RefundDecision;
  assessment: EligibilityAssessmentData;
  result: RefundDecisionResult;
  generatedAt: string;
  generatedBy: string;
}

export interface EmailNotificationRequest {
  refund_decision_id: string;
  recipients: string[];
  pdf_path: string;
  tenant_name: string;
  property_name: string;
  refund_amount: number;
  decision_type: string;
}
