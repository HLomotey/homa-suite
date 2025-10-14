import React from "react";
import { PayrollManagement } from "@/components/payroll/PayrollManagement";
import { PayrollDashboard } from "@/components/payroll/PayrollDashboard";
import { PayrollDeductionsTable } from "@/components/payroll/PayrollDeductionsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, BarChart3, FileText, Receipt } from "lucide-react";

export const PayrollPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Payroll Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage employee payroll records, track hours worked, overtime, and
          deductions with comprehensive reporting capabilities.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Payroll Records
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Payroll Deductions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <PayrollDashboard />
        </TabsContent>

        <TabsContent value="records" className="space-y-6 mt-6">
          <PayrollManagement />
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6 mt-6">
          <PayrollDeductionsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollPage;
