import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, DollarSign, ClipboardList, Building2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const UploadComponent = ({ 
  title, 
  icon: Icon, 
  description, 
  expectedColumns, 
  guidelines, 
  templateName,
  badgeText 
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
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

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
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = expectedColumns.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
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
          <CardDescription>Select an Excel file (.xlsx, .xls) containing {title.toLowerCase()} data</CardDescription>
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
              <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
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
              <AlertDescription>File uploaded successfully! {title} data has been updated.</AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Upload failed. Please check your file format and try again.</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions Section */}
      <Card>
        <CardHeader>
          <CardTitle>File Format Requirements</CardTitle>
          <CardDescription>Ensure your Excel file follows the correct format</CardDescription>
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
              <strong>Download Template:</strong> Use our template to ensure proper formatting
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
        "Employee ID", "First Name", "Last Name", "Department",
        "Position", "Hire Date", "Salary", "Status", "Manager ID", "Location"
      ],
      guidelines: [
        "First row should contain column headers",
        "Date format: MM/DD/YYYY or YYYY-MM-DD",
        "Salary should be numeric (no currency symbols)",
        "Status: Active, Inactive, or Terminated",
        "Maximum file size: 10MB"
      ],
      templateName: "hr_template.csv"
    },
    finance: {
      title: "Finance Data",
      icon: DollarSign,
      description: "Upload Excel files to update financial dashboard data",
      badgeText: "Finance",
      expectedColumns: [
        "Transaction ID", "Date", "Amount", "Category", "Account",
        "Description", "Client", "Invoice ID", "Payment Method", "Status"
      ],
      guidelines: [
        "First row should contain column headers",
        "Date format: MM/DD/YYYY or YYYY-MM-DD",
        "Amount should be numeric (no currency symbols)",
        "Status: Pending, Completed, or Failed",
        "Maximum file size: 10MB"
      ],
      templateName: "finance_template.csv"
    },
    operations: {
      title: "Operations Data",
      icon: ClipboardList,
      description: "Upload Excel files to update operations dashboard data",
      badgeText: "Operations",
      expectedColumns: [
        "Job Order ID", "Client", "Position", "Date Created", "Status",
        "Priority", "Location", "Skills Required", "Assigned To", "Fill Rate"
      ],
      guidelines: [
        "First row should contain column headers",
        "Date format: MM/DD/YYYY or YYYY-MM-DD",
        "Fill Rate should be numeric (0-100)",
        "Status: Open, In Progress, Filled, or Cancelled",
        "Maximum file size: 10MB"
      ],
      templateName: "operations_template.csv"
    },
    rooms: {
      title: "Room Data",
      icon: Building2,
      description: "Upload Excel files to update room and property data",
      badgeText: "Properties",
      expectedColumns: [
        "Room Name", "Property ID", "Property Name", "Room Type", "Status",
        "Area (sq ft)", "Current Occupants", "Max Occupants", "Price", "Date Available"
      ],
      guidelines: [
        "First row should contain column headers",
        "Date format: MM/DD/YYYY or YYYY-MM-DD",
        "Area and price should be numeric",
        "Room Type: Single, Double, Suite, or Studio",
        "Status: Available, Occupied, Maintenance, or Reserved",
        "Maximum file size: 10MB"
      ],
      templateName: "rooms_template.csv"
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Upload className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Excel Uploads</h1>
          <Badge variant="secondary">Data Management</Badge>
        </div>
        <p className="text-muted-foreground">Upload Excel files to update various dashboard data across the system</p>
      </div>

      <Tabs defaultValue="hr" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hr" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            HR Data
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Finance Data
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Operations Data
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Room Data
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
}