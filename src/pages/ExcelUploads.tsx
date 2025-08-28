import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  ClipboardList,
  Building2,
  UserPlus,
  Calculator,
  Clock,
} from "lucide-react";
import UploadStaff from "./UploadStaff";
import UploadPayroll from "./UploadPayroll";
import UploadAttendance from "./UploadAttendance";
import UploadRooms from "./UploadRooms";
import { UploadComponent } from "@/components/excel-upload/UploadComponent";

export default function ExcelUploads() {
  const financeConfig = {
    title: "Finance Data",
    icon: DollarSign,
    description: "Upload Excel files to update financial dashboard data",
    badgeText: "Finance",
    expectedColumns: [
      "Client Name",
      "Invoice #",
      "Date",
      "Invoice Status",
      "Date Paid",
      "Item Description",
      "Rate",
      "Quantity",
      "Discount Percentage",
      "Line Subtotal",
      "Tax 1 Type",
      "Tax 1 Amount",
      "Tax 2 Type",
      "Tax 2 Amount",
      "Line Total",
      "Currency",
    ],
    guidelines: [
      "First row should contain column headers",
      "Date format: MM/DD/YYYY or YYYY-MM-DD",
      "Rate and quantities should be numeric values",
      "Discount percentage should be between 0-100",
      "Invoice Status: pending, paid, overdue, cancelled",
      "Tax types should be GST, VAT, or Sales Tax",
      "Currency should be standard 3-letter code (USD, EUR, GBP)",
      "Maximum file size: 10MB",
    ],
    templateName: "finance_invoice_template.csv",
  };

  const operationsConfig = {
    title: "Operations Data",
    icon: ClipboardList,
    description: "Upload Excel files to update operations dashboard data",
    badgeText: "Operations",
    expectedColumns: [
      "Job Order ID",
      "Client",
      "Position",
      "Date Created",
      "Status",
      "Priority",
      "Location",
      "Assigned To",
      "Due Date",
      "Completion Date",
      "Notes",
    ],
    guidelines: [
      "First row should contain column headers",
      "Date format: MM/DD/YYYY or YYYY-MM-DD",
      "Status should be: pending, in-progress, completed, cancelled",
      "Priority should be: low, medium, high, urgent",
      "All text fields should be properly formatted",
      "Maximum file size: 10MB",
    ],
    templateName: "operations_template.csv",
  };

  const hrConfig = {
    title: "HR Data",
    icon: Users,
    description: "Upload Excel files to update HR dashboard data",
    badgeText: "HR",
    expectedColumns: [
      "Employee ID",
      "First Name",
      "Last Name",
      "Email",
      "Department",
      "Position",
      "Start Date",
      "Salary",
      "Status",
    ],
    guidelines: [
      "First row should contain column headers",
      "Employee ID should be unique",
      "Email format should be valid",
      "Date format: MM/DD/YYYY or YYYY-MM-DD",
      "Salary should be numeric values",
      "Status should be: active, inactive, terminated",
      "Maximum file size: 10MB",
    ],
    templateName: "hr_template.csv",
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Excel Uploads</h1>
        <p className="text-muted-foreground">
          Upload Excel files to update various dashboard data across the system
        </p>
      </div>

      <Tabs defaultValue="hr" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hr" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            HR
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          {/* <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Staff
          </TabsTrigger> */}
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hr" className="space-y-4">
          <UploadComponent {...hrConfig} />
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <UploadComponent {...financeConfig} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <UploadComponent {...operationsConfig} />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <UploadRooms />
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <UploadStaff />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <UploadPayroll />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <UploadAttendance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
