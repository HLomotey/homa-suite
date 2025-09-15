import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Calendar, Home, User, FileText } from 'lucide-react';

interface AssessmentData {
  houseRules?: {
    violations?: string[];
    rulesFollowed?: boolean;
    violationDates?: string[];
  };
  inspectedBy?: string;
  personalItems?: {
    allItemsRemoved?: boolean;
    itemsLeftBehind?: string[];
    disposalRequired?: boolean;
  };
  cleaningStatus?: {
    cleaningIssues?: string[];
    isCleanedProperly?: boolean;
    requiresProfessionalCleaning?: boolean;
  };
  inspectionDate?: string;
  propertyDamage?: {
    hasDamage?: boolean;
    estimatedCost?: number;
    damageDescription?: string;
  };
  additionalNotes?: string;
  programCompliance?: {
    isJ1Staff?: boolean;
    ds2019EndDate?: string;
    programEndDate?: string;
    companyRelocation?: boolean;
  };
  residencyCompliance?: {
    hrReviewRequired?: boolean;
    stayedUntilEndDate?: boolean;
    actualDepartureDate?: string;
    earlyDepartureReason?: string;
  };
}

interface AssessmentDetailsDisplayProps {
  assessmentData: AssessmentData;
}

export const AssessmentDetailsDisplay: React.FC<AssessmentDetailsDisplayProps> = ({ 
  assessmentData 
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const getBooleanBadge = (value?: boolean, trueText = 'Yes', falseText = 'No') => {
    if (value === undefined) return <Badge variant="secondary">Not specified</Badge>;
    return value ? 
      <Badge variant="default" className="bg-green-100 text-green-800">{trueText}</Badge> : 
      <Badge variant="destructive">{falseText}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Inspection Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Inspection Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Inspection Date</label>
              <div className="font-medium">{formatDate(assessmentData.inspectionDate)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Inspected By</label>
              <div className="font-medium">{assessmentData.inspectedBy || 'Not specified'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* House Rules Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            House Rules Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Rules Followed</label>
            <div>{getBooleanBadge(assessmentData.houseRules?.rulesFollowed)}</div>
          </div>
          {assessmentData.houseRules?.violations && assessmentData.houseRules.violations.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Violations</label>
              <div className="space-y-1">
                {assessmentData.houseRules.violations.map((violation, index) => (
                  <Badge key={index} variant="destructive" className="mr-2">
                    {violation}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {assessmentData.houseRules?.violationDates && assessmentData.houseRules.violationDates.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Violation Dates</label>
              <div className="space-y-1">
                {assessmentData.houseRules.violationDates.map((date, index) => (
                  <div key={index} className="text-sm">{formatDate(date)}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">All Items Removed</label>
            <div>{getBooleanBadge(assessmentData.personalItems?.allItemsRemoved)}</div>
          </div>
          {assessmentData.personalItems?.itemsLeftBehind && assessmentData.personalItems.itemsLeftBehind.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Items Left Behind</label>
              <div className="space-y-1">
                {assessmentData.personalItems.itemsLeftBehind.map((item, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Disposal Required</label>
            <div>{getBooleanBadge(assessmentData.personalItems?.disposalRequired)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Cleaning Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Cleaning Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Cleaned Properly</label>
            <div>{getBooleanBadge(assessmentData.cleaningStatus?.isCleanedProperly)}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Requires Professional Cleaning</label>
            <div>{getBooleanBadge(assessmentData.cleaningStatus?.requiresProfessionalCleaning)}</div>
          </div>
          {assessmentData.cleaningStatus?.cleaningIssues && assessmentData.cleaningStatus.cleaningIssues.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cleaning Issues</label>
              <div className="space-y-1">
                {assessmentData.cleaningStatus.cleaningIssues.map((issue, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {issue}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Damage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Property Damage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Has Damage</label>
            <div>{getBooleanBadge(assessmentData.propertyDamage?.hasDamage)}</div>
          </div>
          {assessmentData.propertyDamage?.estimatedCost && assessmentData.propertyDamage.estimatedCost > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estimated Cost</label>
              <div className="font-medium text-red-600">
                ${assessmentData.propertyDamage.estimatedCost.toFixed(2)}
              </div>
            </div>
          )}
          {assessmentData.propertyDamage?.damageDescription && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Damage Description</label>
              <div className="text-sm bg-muted p-2 rounded">
                {assessmentData.propertyDamage.damageDescription}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program Compliance */}
      {assessmentData.programCompliance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Program Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">J1 Staff</label>
              <div>{getBooleanBadge(assessmentData.programCompliance.isJ1Staff)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">DS-2019 End Date</label>
                <div className="font-medium">{formatDate(assessmentData.programCompliance.ds2019EndDate)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Program End Date</label>
                <div className="font-medium">{formatDate(assessmentData.programCompliance.programEndDate)}</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Relocation</label>
              <div>{getBooleanBadge(assessmentData.programCompliance.companyRelocation)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Residency Compliance */}
      {assessmentData.residencyCompliance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Residency Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stayed Until End Date</label>
              <div>{getBooleanBadge(assessmentData.residencyCompliance.stayedUntilEndDate)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">HR Review Required</label>
              <div>{getBooleanBadge(assessmentData.residencyCompliance.hrReviewRequired)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Actual Departure Date</label>
              <div className="font-medium">{formatDate(assessmentData.residencyCompliance.actualDepartureDate)}</div>
            </div>
            {assessmentData.residencyCompliance.earlyDepartureReason && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Early Departure Reason</label>
                <div className="text-sm bg-muted p-2 rounded">
                  {assessmentData.residencyCompliance.earlyDepartureReason}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {assessmentData.additionalNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm bg-muted p-3 rounded">
              {assessmentData.additionalNotes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
