import React from "react";
import { PayrollManagement } from "@/components/payroll/PayrollManagement";

const PayrollPage: React.FC = () => {
  return (
    <div className="space-y-6 px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Payroll Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage staff payroll records, hours worked, deductions, and payment
          information
        </p>
      </div>

      <PayrollManagement />
    </div>
  );
};

export default PayrollPage;
