"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { processExcelData, generateStaffTemplate, STAFF_COLUMN_MAPPINGS, ExcelProcessingResult } from "../utils/excelProcessor";
import { FrontendBillingStaff } from "../integration/supabase/types/billing";

interface UploadStaffProps {
  onStaffUploaded?: (staff: Omit<FrontendBillingStaff, "id">[]) => Promise<void>;
}

export default function UploadStaff({ onStaffUploaded }: UploadStaffProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<ExcelProcessingResult | null>(null);
  const { toast } = useToast();

  // Get column definitions from the utility
  const requiredColumns = STAFF_COLUMN_MAPPINGS
    .filter(mapping => mapping.required)
    .map(mapping => mapping.excelColumn);

  const allColumns = STAFF_COLUMN_MAPPINGS.map(mapping => ({
    name: mapping.excelColumn,
    required: mapping.required,
    description: getColumnDescription(mapping.excelColumn)
  }));

  // Helper function to get column descriptions
  function getColumnDescription(columnName: string): string {
    const descriptions: Record<string, string> = {
      'Legal Name': 'Full legal name of the staff member',
      'Preferred Name': 'Preferred name for daily use',
      'Birth Name': 'Birth name if different from legal name',
      'Email': 'Primary email address',
      'Phone Number': 'Contact phone number',
      'Address': 'Full residential address',
      'Marital Status': 'Single, Married, Divorced, Widowed, Separated, Prefer not to say',
      'Emergency Contact Name': 'Emergency contact full name',
      'Emergency Contact Phone': 'Emergency contact phone number',
      'Emergency Contact Relationship': 'Spouse, Parent, Child, Sibling, Friend, Other',
      'Employee ID': 'Unique employee identifier',
      'Job Title': 'Current job title/position',
      'Department': 'Department name',
      'Location': 'Work location',
      'Employment Status': 'Full-time, Part-time, Contractor, Temporary, Intern',
      'Hire Date': 'Date of hire (YYYY-MM-DD format)',
      'Termination Date': 'Date of termination (YYYY-MM-DD format)',
      'Gender': 'Male, Female, Non-binary, Prefer not to say',
      'Ethnicity/Race': 'Ethnicity or race information',
      'Veteran Status': 'Not a veteran, Veteran, Disabled veteran, Recently separated veteran, Prefer not to say',
      'Disability Status': 'No disability, Has a disability, Prefer not to say',
      'Annual Salary': 'Annual salary amount (numbers only)',
      'Hourly Rate': 'Hourly rate (numbers only)'
    };
    return descriptions[columnName] || 'Field description';
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.name.endsWith('.xlsx') || 
          selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const processExcelFile = async (file: File): Promise<ExcelProcessingResult> => {
    // This is a mock implementation - in a real app, you'd use a library like xlsx or SheetJS
    // to parse the Excel file and convert it to the appropriate format
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful processing
        const mockData: Omit<FrontendBillingStaff, "id">[] = [
          {
            legalName: "John Doe",
            preferredName: "John",
            email: "john.doe@company.com",
            phoneNumber: "+1 (555) 123-4567",
            employeeId: "EMP001",
            jobTitle: "Software Engineer",
            department: "IT",
            employmentStatus: "Full-time",
            hireDate: "2023-01-15",
          },
          {
            legalName: "Jane Smith",
            preferredName: "Jane",
            email: "jane.smith@company.com",
            phoneNumber: "+1 (555) 987-6543",
            employeeId: "EMP002",
            jobTitle: "HR Manager",
            department: "HR",
            employmentStatus: "Full-time",
            hireDate: "2022-06-01",
          }
        ];

        resolve({
          success: true,
          data: mockData,
          warnings: [
            "2 records processed successfully",
            "Some optional fields were empty and will be left blank"
          ]
        });
      }, 2000);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await processExcelFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadResult(result);

      if (result.success && result.data && onStaffUploaded) {
        await onStaffUploaded(result.data);
        toast({
          title: "Upload successful",
          description: `${result.data.length} staff members uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        errors: ["Failed to process the Excel file. Please check the format and try again."]
      });
      toast({
        title: "Upload failed",
        description: "There was an error processing your file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = generateStaffTemplate();
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template downloaded",
      description: "Use this template to format your staff data",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Upload Staff Data</h2>
          <p className="text-muted-foreground">Upload Excel files to add staff information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Excel File</span>
              </CardTitle>
              <CardDescription>
                Select an Excel file (.xlsx, .xls) containing staff data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Selection */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600">Choose Excel file to upload</p>
                    <Label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {file && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-gray-500 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload Button */}
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || uploading || (uploadProgress > 0 && uploadProgress < 100)}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Staff Data
                    </>
                  )}
                </Button>
              </div>

              {/* Upload Results */}
              {uploadResult && (
                <div className="space-y-4">
                  <Separator />
                  
                  {uploadResult.success ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Upload completed successfully! {uploadResult.data?.length} staff members processed.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-red-200 bg-red-50" variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Upload failed. Please check your file format and try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <div className="space-y-1">
                          {uploadResult.warnings.map((warning, index) => (
                            <div key={index}>• {warning}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <Alert className="border-red-200 bg-red-50" variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {uploadResult.errors.map((error, index) => (
                            <div key={index}>• {error}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Requirements & Template */}
        <div className="space-y-6">
          {/* File Format Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Format Requirements</CardTitle>
              <CardDescription>
                Ensure your Excel file follows the correct format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <div className="space-y-1">
                  {requiredColumns.map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                      <span className="text-sm">{column}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Guidelines:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• File should be in Excel format (.xlsx or .xls)</li>
                  <li>• First row should contain column headers</li>
                  <li>• Date format: YYYY-MM-DD</li>
                  <li>• Salary should be numeric (no currency symbols)</li>
                  <li>• Status: Active, Inactive, or Terminated</li>
                  <li>• Location should be a valid office location</li>
                </ul>
              </div>

              <Button 
                onClick={downloadTemplate} 
                variant="outline" 
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* Available Columns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Columns</CardTitle>
              <CardDescription>
                All columns that can be included in your Excel file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allColumns.map((column) => (
                  <div key={column.name} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={column.required ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {column.required ? "Required" : "Optional"}
                      </Badge>
                      <span className="font-medium text-sm">{column.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-16">{column.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
