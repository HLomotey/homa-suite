/**
 * PDF Report Generation Service for Security Deposit Refund Decisions
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PDFReportData, RefundDecision, EligibilityAssessmentData } from '@/integration/supabase/types/refund-decision';
import { FrontendSecurityDeposit } from '@/integration/supabase/types/security-deposit';
import { Assignment, FrontendAssignment } from '@/integration/supabase/types/assignment';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class PDFReportService {
  private static readonly COMPANY_NAME = 'BOH Housing Services';
  private static readonly REPORT_TITLE = 'Security Deposit Refund Assessment Report';
  
  /**
   * Generate PDF report for refund decision
   */
  static async generateRefundReport(
    deposit: FrontendSecurityDeposit,
    assignment: FrontendAssignment,
    decision: RefundDecision,
    currentUser: string
  ): Promise<{ pdfBlob: Blob; filename: string }> {
    const doc = new jsPDF();
    
    // Set up document properties
    doc.setProperties({
      title: `Security Deposit Refund Report - ${assignment.tenantName}`,
      subject: 'Security Deposit Assessment',
      author: this.COMPANY_NAME,
      creator: 'BOH Housing Management System'
    });

    let yPosition = 20;

    // Header
    yPosition = this.addHeader(doc, yPosition, decision, currentUser);
    
    // Tenant and Property Information
    yPosition = this.addTenantInfo(doc, deposit, assignment, yPosition);
    
    // Decision Summary
    yPosition = this.addDecisionSummary(doc, decision, yPosition);
    
    // Assessment Details
    yPosition = this.addAssessmentDetails(doc, decision.assessment_data, yPosition);
    
    // Deduction Breakdown
    if (decision.total_deductions > 0) {
      yPosition = this.addDeductionBreakdown(doc, decision, yPosition);
    }
    
    // Audit Information
    yPosition = this.addAuditInfo(doc, decision, currentUser, yPosition);
    
    // Footer
    this.addFooter(doc);

    // Generate blob and filename
    const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    const filename = `refund-report-${assignment.tenantName?.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    return { pdfBlob, filename };
  }

  private static addHeader(doc: jsPDF, yPosition: number, decision: RefundDecision, currentUser: string): number {
    // Company logo placeholder (you can add actual logo here)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(this.COMPANY_NAME, 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(16);
    doc.text(this.REPORT_TITLE, 20, yPosition);
    
    yPosition += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    
    // Add approval information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Approval Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Approved by: ${currentUser}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Approval Date: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Decision ID: ${decision.id}`, 20, yPosition);
    yPosition += 15;

    return yPosition;
  }

  private static addTenantInfo(
    doc: jsPDF, 
    deposit: FrontendSecurityDeposit, 
    assignment: FrontendAssignment, 
    yPosition: number
  ): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tenant & Property Information', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Helper function to safely format dates
    const formatDate = (dateValue: string | Date | null | undefined): string => {
      if (!dateValue) return 'N/A';
      
      try {
        const date = new Date(dateValue);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date value:', dateValue);
          return 'Invalid Date';
        }
        return format(date, 'MMM dd, yyyy');
      } catch (error) {
        console.error('Date formatting error:', error, 'for value:', dateValue);
        return 'Invalid Date';
      }
    };

    // Helper function to format assignment period safely
    const formatAssignmentPeriod = (): string => {
      const startDate = formatDate(assignment.startDate);
      const endDate = formatDate(assignment.endDate);
      
      if (startDate === 'N/A' && endDate === 'N/A') {
        return 'N/A';
      } else if (startDate === 'N/A') {
        return `Unknown - ${endDate}`;
      } else if (endDate === 'N/A') {
        return `${startDate} - Ongoing`;
      } else {
        return `${startDate} - ${endDate}`;
      }
    };

    const tenantInfo = [
      ['Tenant Name:', assignment.tenantName || 'N/A'],
      ['Property:', assignment.propertyName || 'N/A'],
      ['Room:', assignment.roomName || 'N/A'],
      ['Assignment Period:', formatAssignmentPeriod()],
      ['Security Deposit ID:', deposit.id],
      ['Deposit Amount:', `$${deposit.totalAmount.toFixed(2)}`],
      ['Payment Status:', deposit.paymentStatus]
    ];

    tenantInfo.forEach(([label, value]) => {
      doc.text(label, 20, yPosition);
      doc.text(value, 80, yPosition);
      yPosition += 7;
    });

    return yPosition + 10;
  }

  private static addDecisionSummary(doc: jsPDF, decision: RefundDecision, yPosition: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Refund Decision Summary', 20, yPosition);
    
    yPosition += 10;

    // Decision box
    const boxHeight = 25;
    doc.setFillColor(decision.decision_type === 'Approved' ? 220 : decision.decision_type === 'Denied' ? 255 : 255, 
                     decision.decision_type === 'Approved' ? 255 : decision.decision_type === 'Denied' ? 220 : 255, 
                     decision.decision_type === 'Approved' ? 220 : 220);
    doc.rect(20, yPosition, 170, boxHeight, 'F');
    doc.setDrawColor(0);
    doc.rect(20, yPosition, 170, boxHeight);

    yPosition += 8;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Decision: ${decision.decision_type.toUpperCase()}`, 25, yPosition);
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.text(`Refund Amount: $${decision.refund_amount.toFixed(2)}`, 25, yPosition);
    
    if (decision.total_deductions > 0) {
      doc.text(`Total Deductions: $${decision.total_deductions.toFixed(2)}`, 120, yPosition);
    }

    yPosition += 15;

    if (decision.requires_hr_review) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 0, 0);
      doc.text('⚠️ HR Review Required', 25, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    }

    return yPosition + 10;
  }

  private static addAssessmentDetails(
    doc: jsPDF, 
    assessment: EligibilityAssessmentData, 
    yPosition: number
  ): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Details', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Property Damage
    yPosition = this.addAssessmentSection(doc, 'Property Damage Assessment', [
      ['Damage Found:', assessment.propertyDamage.hasDamage ? 'Yes' : 'No'],
      ...(assessment.propertyDamage.hasDamage ? [
        ['Description:', assessment.propertyDamage.damageDescription],
        ['Estimated Cost:', `$${assessment.propertyDamage.estimatedCost.toFixed(2)}`]
      ] : [])
    ], yPosition);

    // Cleaning Status
    yPosition = this.addAssessmentSection(doc, 'Cleaning Assessment', [
      ['Properly Cleaned:', assessment.cleaningStatus.isCleanedProperly ? 'Yes' : 'No'],
      ...(assessment.cleaningStatus.cleaningIssues.length > 0 ? [
        ['Issues Found:', assessment.cleaningStatus.cleaningIssues.join(', ')]
      ] : []),
      ['Professional Cleaning Required:', assessment.cleaningStatus.requiresProfessionalCleaning ? 'Yes' : 'No']
    ], yPosition);

    // Personal Items
    yPosition = this.addAssessmentSection(doc, 'Personal Items', [
      ['All Items Removed:', assessment.personalItems.allItemsRemoved ? 'Yes' : 'No'],
      ...(assessment.personalItems.itemsLeftBehind.length > 0 ? [
        ['Items Left Behind:', assessment.personalItems.itemsLeftBehind.join(', ')]
      ] : []),
      ['Disposal Required:', assessment.personalItems.disposalRequired ? 'Yes' : 'No']
    ], yPosition);

    // House Rules Compliance
    yPosition = this.addAssessmentSection(doc, 'House Rules Compliance', [
      ['Rules Followed:', assessment.houseRules.rulesFollowed ? 'Yes' : 'No'],
      ...(assessment.houseRules.violations.length > 0 ? [
        ['Violations:', assessment.houseRules.violations.join(', ')]
      ] : [])
    ], yPosition);

    return yPosition;
  }

  private static addAssessmentSection(
    doc: jsPDF, 
    title: string, 
    items: string[][], 
    yPosition: number
  ): number {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(title, 25, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    items.forEach(([label, value]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${label}`, 30, yPosition);
      doc.text(value, 90, yPosition);
      yPosition += 6;
    });

    return yPosition + 5;
  }

  private static addDeductionBreakdown(doc: jsPDF, decision: RefundDecision, yPosition: number): number {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Deduction Breakdown', 20, yPosition);
    
    yPosition += 10;

    // Create deductions table
    const deductions = this.calculateDeductions(decision.assessment_data);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Description', 'Amount']],
      body: deductions.map(d => [d.reason, `$${d.amount.toFixed(2)}`]),
      foot: [['Total Deductions', `$${decision.total_deductions.toFixed(2)}`]],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      footStyles: { fillColor: [52, 73, 94], fontStyle: 'bold' }
    });

    return (doc as any).lastAutoTable.finalY + 15;
  }

  private static calculateDeductions(assessment: EligibilityAssessmentData): Array<{reason: string, amount: number}> {
    const deductions = [];

    if (assessment.propertyDamage.hasDamage) {
      deductions.push({
        reason: `Property Damage: ${assessment.propertyDamage.damageDescription}`,
        amount: assessment.propertyDamage.estimatedCost
      });
    }

    if (assessment.cleaningStatus.requiresProfessionalCleaning) {
      deductions.push({
        reason: 'Professional Cleaning Required',
        amount: 150
      });
    } else if (!assessment.cleaningStatus.isCleanedProperly) {
      deductions.push({
        reason: 'Standard Cleaning Fee',
        amount: 75
      });
    }

    if (assessment.personalItems.disposalRequired) {
      deductions.push({
        reason: 'Personal Items Disposal',
        amount: 50
      });
    }

    if (!assessment.houseRules.rulesFollowed) {
      const violationCount = assessment.houseRules.violations.length;
      deductions.push({
        reason: `House Rules Violations (${violationCount})`,
        amount: violationCount * 25
      });
    }

    return deductions;
  }

  private static addAuditInfo(
    doc: jsPDF, 
    decision: RefundDecision, 
    currentUser: string, 
    yPosition: number
  ): number {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Audit Information', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const auditInfo = [
      ['Report Generated:', format(new Date(), 'MMM dd, yyyy HH:mm:ss')],
      ['Generated By:', currentUser],
      ['Decision Made:', format(new Date(decision.approved_at), 'MMM dd, yyyy HH:mm:ss')],
      ['Approved By:', decision.approved_by || 'System'],
      ...(decision.hr_reviewed_by ? [
        ['HR Reviewed By:', decision.hr_reviewed_by],
        ['HR Review Date:', format(new Date(decision.hr_reviewed_at!), 'MMM dd, yyyy HH:mm:ss')]
      ] : [])
    ];

    auditInfo.forEach(([label, value]) => {
      doc.text(label, 20, yPosition);
      doc.text(value, 80, yPosition);
      yPosition += 7;
    });

    return yPosition + 10;
  }

  private static addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${this.COMPANY_NAME} - Confidential Document - Page ${i} of ${pageCount}`,
        20,
        285
      );
      doc.text(
        `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm:ss')}`,
        150,
        285
      );
    }
  }
}
