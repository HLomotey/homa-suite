import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign,
  ClipboardList,
  Building2,
  Download,
  UserPlus,
  Calculator,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import UploadStaff from "./UploadStaff";
import UploadPayroll from "./UploadPayroll";
import UploadAttendance from "./UploadAttendance";
import UploadRooms from "./UploadRooms";
import * as XLSX from "xlsx";

const UploadComponent = ({
  title,
  icon: Icon,
  description,
  expectedColumns,
  guidelines,
  templateName,
  badgeText,
}: {
  title: string;
  icon: any;
  description: string;
  expectedColumns: string[];
  guidelines: string[];
  templateName: string;
  badgeText: string;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadStatus("success");
          toast.success(`${title} file uploaded successfully!`);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = expectedColumns.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateName;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`${templateName} downloaded successfully`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Select an Excel file (.xlsx, .xls) containing {title.toLowerCase()}{" "}
            data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Choose File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {uploadStatus === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File uploaded successfully! {title} data has been updated.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload failed. Please check your file format and try again.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions Section */}
      <Card>
        <CardHeader>
          <CardTitle>File Format Requirements</CardTitle>
          <CardDescription>
            Ensure your Excel file follows the correct format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Columns:</h4>
            <div className="grid grid-cols-2 gap-2">
              {expectedColumns.map((column, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {column}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Guidelines:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {guidelines.map((guideline, index) => (
                <li key={index}>• {guideline}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary mb-2">
              <strong>Download Template:</strong> Use our template to ensure
              proper formatting
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {title} Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ExcelUploads() {
  const uploadConfigs = {
    hr: {
      title: "HR Data",
      icon: Users,
      description: "Upload Excel files to update HR dashboard data",
      badgeText: "Human Resources",
      expectedColumns: [
        "Employee ID",
        "First Name",
        "Last Name",
        "Department",
        "Position",
        "Hire Date",
        "Salary",
        "Status",
        "Manager ID",
        "Location",
      ],
      guidelines: [
        "First row should contain column headers",
        "Date format: MM/DD/YYYY or YYYY-MM-DD",
        "Salary should be numeric (no currency symbols)",
        "Status: Active, Inactive, or Terminated",
        "Maximum file size: 10MB",
      ],
      templateName: "hr_template.csv",
    },
    finance: {
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
    },
    operations: {
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
        "Skills Required",
        "Assigned To",
        "Fill Rate",
      ],
      guidelines: [
        "First row should contain column headers",
        "Date format: MM/DD/YYYY or YYYY-MM-DD",
        "Fill Rate should be numeric (0-100)",
        "Status: Open, In Progress, Filled, or Cancelled",
        "Maximum file size: 10MB",
      ],
      templateName: "operations_template.csv",
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Upload className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Excel Uploads</h1>
          <Badge variant="secondary">Data Management</Badge>
        </div>
        <p className="text-muted-foreground">
          Upload Excel files to update various dashboard data across the system
        </p>
      </div>

      <Tabs defaultValue="hr" className="w-full">
        <TabsList className="grid grid-cols-7 max-w-4xl">
          <TabsTrigger value="hr">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">HR</span>
          </TabsTrigger>
          <TabsTrigger value="finance">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="operations">
            <ClipboardList className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Operations</span>
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="staff">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Payroll</span>
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
        </TabsList>

        {/* HR, Finance, Operations tabs */}
        {Object.entries(uploadConfigs).map(([key, config]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <config.icon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload {config.title}</h2>
              <Badge variant="secondary">{config.badgeText}</Badge>
            </div>
            <p className="text-muted-foreground mb-4">{config.description}</p>

            <UploadComponent {...config} />
          </TabsContent>
        ))}

        {/* Rooms Upload Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Upload Room Data</h2>
            <Badge variant="secondary">Properties</Badge>
          </div>
          <p className="text-muted-foreground mb-4">
            Upload Excel files to update room data in the database
          </p>
          <UploadRooms />
        </TabsContent>

        {/* Staff Upload Tab */}
        <TabsContent value="staff" className="space-y-6">
          <UploadStaff />
        </TabsContent>

        {/* Payroll Upload Tab */}
        <TabsContent value="payroll" className="space-y-6">
          <UploadPayroll />
        </TabsContent>

        {/* Attendance Upload Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <UploadAttendance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
