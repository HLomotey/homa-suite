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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, DollarSign, Receipt } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PayrollDeductionsUpload } from "@/components/payroll/PayrollDeductionsUpload";

interface PayrollRecord {
  employeeId: string;
  regularHours: number;
  overtimeHours: number;
  rent: number;
  transport: number;
  penalties: number;
  payDate: string;
  payPeriod: string;
}

interface PayrollProcessingResult {
  success: boolean;
  data?: PayrollRecord[];
  errors?: string[];
  warnings?: string[];
  totalRows?: number;
  processedRows?: number;
}

interface UploadPayrollProps {
  onPayrollUploaded?: (payroll: PayrollRecord[]) => Promise<void>;
}

export default function UploadPayroll({ onPayrollUploaded }: UploadPayrollProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<PayrollProcessingResult | null>(null);
  const { toast } = useToast();

  // Required columns for payroll deductions
  const requiredColumns = [
    'Position ID',
    'start_period',
    'end_period'
  ];

  // All available columns with descriptions for payroll deductions
  const allColumns = [
    { name: 'Position ID', required: true, description: 'Unique position identifier' },
    { name: 'BCD_Bus Card_Deduction', required: false, description: 'Bus card deduction amount (numbers only)' },
    { name: 'Security_Deposit_Deduction', required: false, description: 'Security deposit deduction amount (numbers only)' },
    { name: 'RNT_Rent_Deduction', required: false, description: 'Rent deduction amount (numbers only)' },
    { name: 'TRN_Transport Subs_Deduction', required: false, description: 'Transport subsidy deduction amount (numbers only)' },
    { name: 'start_period', required: true, description: 'Start date of deduction period (YYYY-MM-DD format)' },
    { name: 'end_period', required: true, description: 'End date of deduction period (YYYY-MM-DD format)' }
  ];

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

  const processPayrollFile = async (file: File): Promise<PayrollProcessingResult> => {
    // Mock implementation - in a real app, you'd use a library like xlsx or SheetJS
    // to parse the Excel file and convert it to the appropriate format
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful processing
        const mockData: PayrollRecord[] = [
          {
            employeeId: "EMP001",
            regularHours: 160,
            overtimeHours: 8,
            rent: 500,
            transport: 100,
            penalties: 0,
            payDate: "2024-01-31",
            payPeriod: "January 2024"
          },
          {
            employeeId: "EMP002",
            regularHours: 160,
            overtimeHours: 12,
            rent: 600,
            transport: 120,
            penalties: 50,
            payDate: "2024-01-31",
            payPeriod: "January 2024"
          },
          {
            employeeId: "EMP003",
            regularHours: 152,
            overtimeHours: 0,
            rent: 450,
            transport: 80,
            penalties: 0,
            payDate: "2024-01-31",
            payPeriod: "January 2024"
          }
        ];

        resolve({
          success: true,
          data: mockData,
          warnings: [
            "3 payroll records processed successfully",
            "All monetary amounts have been validated",
            "Pay dates and periods verified"
          ],
          totalRows: 3,
          processedRows: 3
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

      const result = await processPayrollFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadResult(result);

      if (result.success && result.data && onPayrollUploaded) {
        await onPayrollUploaded(result.data);
        toast({
          title: "Upload successful",
          description: `${result.data.length} payroll records uploaded successfully`,
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
    // Generate CSV template with sample data for payroll deductions
    const headers = allColumns.map(col => col.name);
    const sampleData = [
      '04000255', // Position ID
      '50.00', // BCD_Bus Card_Deduction
      '50.00', // Security_Deposit_Deduction
      '225.00', // RNT_Rent_Deduction
      '225.00', // TRN_Transport Subs_Deduction
      '2025-01-01', // start_period
      '2025-12-31' // end_period
    ];
    
    const csvContent = headers.join(',') + '\n' + sampleData.join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_deductions_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template downloaded",
      description: "Use this template to format your payroll deductions data",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-600 rounded-lg">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Payroll Deductions Management</h2>
          <p className="text-muted-foreground">Upload Excel files to process employee payroll deductions data</p>
        </div>
      </div>

      <Tabs defaultValue="payroll-data" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payroll-data" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll Data
          </TabsTrigger>
          <TabsTrigger value="payroll-deductions" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Payroll Deductions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payroll-data" className="space-y-6">
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
                Select an Excel file (.xlsx, .xls) containing payroll data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Selection */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600">Choose Excel file to upload</p>
                    <Label htmlFor="payroll-file-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                    <Input
                      id="payroll-file-upload"
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
                      Processing Payroll...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Payroll Data
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
                        Upload completed successfully! {uploadResult.data?.length} payroll records processed.
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
                  <li>• Date format: YYYY-MM-DD for period dates</li>
                  <li>• Deduction amounts should be numeric (decimal allowed, no currency symbols)</li>
                  <li>• Position ID should match existing position records</li>
                  <li>• start_period date should be before end_period date</li>
                  <li>• Use 0.00 for deductions that don't apply to a position</li>
                  <li>• Column names must match exactly (case sensitive)</li>
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
        </TabsContent>

        <TabsContent value="payroll-deductions">
          <PayrollDeductionsUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}
