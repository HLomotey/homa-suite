# Housing Agreement Billing Process Documentation

## Overview

This document outlines the comprehensive billing process for housing agreements in the HOMA Suite system, including security deposit management, bi-weekly deduction schedules, and payroll integration.

## System Architecture

### Core Components

1. **AssignmentForm.tsx** - Main form for creating housing assignments with benefit agreements
2. **Security Deposit Management** - Handles deposit collection and deduction scheduling
3. **Billing Engine** - Processes semi-monthly billing cycles
4. **Payroll Integration** - Manages deductions from employee paychecks

## Housing Agreement Process Flow

### 1. Assignment Creation

When a user creates a new assignment in `AssignmentForm.tsx`:

```typescript
// Location: src/components/properties/AssignmentForm.tsx
// Lines: 94-98, 857-877

const [housingAgreement, setHousingAgreement] = React.useState(false);
```

**Process Steps:**
1. User selects tenant from external staff database
2. User assigns property and room
3. User checks "Housing Agreement" checkbox
4. System validates that at least one benefit agreement is selected
5. Security deposit form becomes available for housing agreement

### 2. Security Deposit Configuration

When housing agreement is selected, the system requires security deposit setup:

```typescript
// Location: src/components/properties/AssignmentForm.tsx
// Lines: 964-999, 1083-1122

const createSecurityDeposit = (benefitType: 'housing' | 'transportation' | 'flight_agreement' | 'bus_card'): SecurityDeposit => ({
  benefitType,
  totalAmount: 0,
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  paidDate: "",
  notes: "",
  deductionSchedule: []
});
```

**Security Deposit Fields:**
- **Total Amount**: Dollar amount of the security deposit (required)
- **Payment Method**: Cash, Check, Bank Transfer, Credit Card, Other
- **Payment Status**: Pending or Paid
- **Payment Date**: When deposit was received
- **Notes**: Additional information

### 3. Bi-Weekly Deduction Schedule Generation

The system automatically generates a 4-installment bi-weekly deduction schedule:

```typescript
// Location: src/components/properties/AssignmentForm.tsx
// Lines: 124-141

const generateDeductionSchedule = (totalAmount: number, startDate: string) => {
  if (totalAmount <= 0 || !startDate) return [];
  
  const deductionAmount = totalAmount / 4;
  const start = new Date(startDate);
  
  return Array.from({ length: 4 }, (_, index) => {
    const scheduledDate = new Date(start);
    scheduledDate.setDate(scheduledDate.getDate() + (14 * (index + 1))); // Bi-weekly
    
    return {
      deductionNumber: index + 1,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      amount: deductionAmount,
      status: 'scheduled' as const
    };
  });
};
```

**Deduction Schedule Details:**
- **Total Installments**: 4 payments
- **Payment Frequency**: Every 14 days (bi-weekly)
- **Amount per Installment**: Total deposit ÷ 4
- **Recovery Period**: 8 weeks total
- **Status Tracking**: scheduled → deducted → completed

### 4. Assignment Validation and Saving

Before saving, the system validates:

```typescript
// Location: src/components/properties/AssignmentForm.tsx
// Lines: 457-500

// Validate that at least one benefit agreement is selected
if (!housingAgreement && !transportationAgreement && !flightAgreement && !busCardAgreement) {
  toast({
    title: "Validation Error",
    description: "Please select at least one benefit agreement.",
    variant: "destructive",
  });
  return;
}

// Validate security deposits for selected benefit agreements
const benefitValidations = [
  { agreement: housingAgreement, type: 'housing', label: 'Housing' },
  // ... other agreements
];

for (const { agreement, type, label } of benefitValidations) {
  if (agreement) {
    const deposit = securityDeposits[type as keyof typeof securityDeposits];
    if (!deposit || deposit.totalAmount <= 0) {
      toast({
        title: "Validation Error",
        description: `Please enter a security deposit amount for the ${label} agreement.`,
        variant: "destructive",
      });
      return;
    }
  }
}
```

## Billing Cycle Management

### Semi-Monthly Billing Windows

The system uses a semi-monthly billing approach with two billing periods per month:

```typescript
// Location: src/lib/billing/semimonthly.ts
// Lines: 7-21

export function getBillingWindowsForMonth(
  year: number,
  month: number,
  zone = "America/Los_Angeles"
): [BillingWindow, BillingWindow] {
  const startOfMonth = DateTime.fromObject({ year, month, day: 1 }, { zone });
  const mid = startOfMonth.set({ day: 15 });
  const secondStart = startOfMonth.set({ day: 16 });
  const endOfMonth = startOfMonth.endOf("month").startOf("day");

  return [
    { start: startOfMonth, end: mid },               // 1–15 inclusive
    { start: secondStart, end: endOfMonth },         // 16–EOM inclusive
  ];
}
```

**Billing Periods:**
- **First Period**: 1st - 15th of each month
- **Second Period**: 16th - End of month
- **Payment Processing**: Bi-weekly cycles align with payroll

### Rent Amount Calculation

Monthly rent is converted to bi-weekly amounts for payroll deduction:

```typescript
// Location: src/lib/billing/generateForMonth.ts
// Lines: 28, 41

rent_amount: s.rent_amount / 2, // Convert monthly to biweekly
```

**Calculation Logic:**
- Monthly rent amount is divided by 2
- Results in two equal payments per month
- Aligns with bi-weekly payroll cycles

## Payroll Integration

### Deduction Processing

The system integrates with payroll for automatic deductions:

```typescript
// Location: src/integration/supabase/types/billing.ts
// Lines: 186-217

export interface Payroll {
  id: string;
  staff_id: string;
  regular_hours: number | null;
  overtime_hours: number | null;
  rent: number | null;           // Housing rent deduction
  transport: number | null;      // Transportation deduction
  penalties: number | null;
  pay_date: string;
  pay_period: string;
  created_at: string;
  updated_at: string | null;
}
```

**Payroll Fields:**
- **rent**: Housing charges deducted from paycheck
- **transport**: Transportation charges
- **penalties**: Any penalty deductions
- **pay_period**: Identifies the billing cycle
- **pay_date**: When payroll was processed

### Security Deposit Recovery

Security deposits are recovered through payroll deductions:

```typescript
// Location: src/integration/supabase/api/security-deposits.ts
// Lines: 17-22

export const createSecurityDeposit = async (
  assignmentId: string,
  totalAmount: number = 500,
  paymentMethod: string = 'payroll_deduction',
  notes?: string
): Promise<FrontendSecurityDeposit>
```

**Recovery Process:**
1. Security deposit is divided into 4 equal installments
2. Deductions occur every 14 days (bi-weekly)
3. Deductions are processed through payroll system
4. Status is tracked: scheduled → deducted → completed

## Data Models

### Security Deposit Structure

```typescript
// Location: src/integration/supabase/types/security-deposit.ts
// Lines: 11-25

export interface SecurityDeposit {
  id: string;
  assignment_id: string;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  paid_date: string | null;
  refund_date: string | null;
  refund_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}
```

### Deduction Schedule Structure

```typescript
// Location: src/integration/supabase/types/security-deposit.ts
// Lines: 30-43

export interface SecurityDepositDeduction {
  id: string;
  security_deposit_id: string;
  deduction_number: number;
  scheduled_date: string;
  amount: number;
  status: 'scheduled' | 'deducted' | 'waived' | 'adjusted';
  actual_deduction_date: string | null;
  actual_amount: number | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

## Business Rules

### Housing Agreement Requirements

1. **Mandatory Fields:**
   - Tenant selection (from external staff)
   - Property and room assignment
   - Start date
   - Security deposit amount (if housing agreement selected)

2. **Validation Rules:**
   - At least one benefit agreement must be selected
   - Security deposit amount must be greater than 0 for housing agreements
   - Deduction schedule total must equal security deposit amount
   - Staff member must exist in external staff database

3. **Security Deposit Rules:**
   - Default recovery period: 8 weeks (4 bi-weekly installments)
   - Payment methods: Cash, Check, Bank Transfer, Credit Card, Other
   - Status tracking: Pending → Paid → Refunded (if applicable)

### Billing Cycle Rules

1. **Semi-Monthly Periods:**
   - First period: 1st-15th of month
   - Second period: 16th-end of month
   - Rent is split equally between periods

2. **Employment Overlap:**
   - Billing only occurs if employment overlaps with billing window
   - Terminated employees are billed for partial periods they worked
   - New hires are billed from their start date

3. **Payroll Integration:**
   - Rent deductions align with bi-weekly payroll cycles
   - Security deposit deductions are separate line items
   - All deductions are tracked in payroll records

## Error Handling and Validation

### Form Validation

The system performs comprehensive validation before saving assignments:

1. **Required Field Validation:**
   - Tenant ID must be valid
   - Property and room must be selected
   - Start date is required
   - Security deposit amount required for housing agreements

2. **Business Logic Validation:**
   - Deduction schedule totals must match deposit amounts
   - Staff member must exist in external staff database
   - At least one benefit agreement must be selected

3. **Data Integrity:**
   - Assignment dates must be logical (start before end)
   - Rent amounts must be positive numbers
   - Security deposit amounts must be positive

### Error Messages

The system provides clear error messages for validation failures:

```typescript
toast({
  title: "Validation Error",
  description: "Please enter a security deposit amount for the Housing agreement.",
  variant: "destructive",
});
```

## Security and Permissions

### Role-Based Access

- **Properties Manager**: Can override rent amounts
- **Admin/Administrator**: Full access to all functions
- **Regular Users**: Limited to standard assignment creation

### Rent Override Protection

```typescript
// Location: src/components/properties/AssignmentForm.tsx
// Lines: 775-799

{(hasRole("Properties Manager") || hasRole("admin") || hasRole("administrator")) && (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => {
      if (!isRentOverrideEnabled) {
        setIsRentOverrideEnabled(true);
        toast({
          title: "Override Enabled",
          description: "You can now modify the rent amount. Original amount: $" + originalRentAmount,
        });
      }
    }}
  >
    {isRentOverrideEnabled ? "Reset" : "Override"}
  </Button>
)}
```

## Troubleshooting

### Common Issues

1. **Missing Security Deposit Form:**
   - Ensure housing agreement checkbox is selected
   - Check that form validation is passing

2. **Deduction Schedule Not Generating:**
   - Verify start date is provided
   - Ensure security deposit amount is greater than 0
   - Check that generateDeductionSchedule function is called

3. **Billing Not Processing:**
   - Verify assignment has active status
   - Check that employment dates overlap with billing windows
   - Ensure rent amount is properly set

### Debugging Tools

The system includes debugging capabilities:

```typescript
// Location: src/components/billing/BillingDebugger.tsx
// Location: src/components/billing/BillingTracer.tsx
```

These components help trace billing calculations and identify issues in the billing process.

## Future Enhancements

### Planned Features

1. **Automated Payroll Integration:**
   - Direct API integration with payroll systems
   - Real-time deduction processing
   - Automated status updates

2. **Enhanced Reporting:**
   - Security deposit recovery reports
   - Billing cycle analytics
   - Delinquency tracking

3. **Mobile Support:**
   - Mobile-responsive assignment forms
   - Push notifications for payment due dates
   - Mobile approval workflows

## Conclusion

The housing agreement billing process in HOMA Suite provides a comprehensive solution for managing staff housing assignments, security deposits, and payroll deductions. The system ensures accurate billing cycles, proper security deposit recovery, and seamless integration with payroll processing.

Key benefits:
- Automated bi-weekly deduction scheduling
- Semi-monthly billing alignment with payroll
- Comprehensive validation and error handling
- Role-based security and permissions
- Detailed audit trails and reporting

For technical support or questions about this process, refer to the component documentation or contact the development team.
