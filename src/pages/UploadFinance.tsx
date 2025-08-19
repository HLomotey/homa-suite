"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, DollarSign, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useUploadInvoices } from "@/hooks/finance/useInvoice";
import { FrontendInvoice } from "@/integration/supabase/types/finance";

export default function UploadFinance() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const { upload, loading: uploading, progress: uploadProgress, error } = useUploadInvoices();
  
  // Function to generate and download an Excel template
  const downloadTemplate = () => {
    // In a real implementation, we would use a library like xlsx or exceljs
    // to generate an actual Excel file. For now, we'll create a CSV file
    // which can be opened in Excel.
    
    // Create header row based on the exact Excel template format from the image
    const headers = [
      "Transactio",
      "Date",
      "Amount",
      "Category",
      "Account",
      "Descriptio",
      "Client",
      "Invoice ID",
      "Payment M",
      "Status"
    ];
    
    // Create sample data row matching the format from the image
    const sampleData = [
      "TRX12345",
      "2025-08-15",
      "1500.00",
      "Revenue",
      "Business Account",
      "Monthly service fee",
      "Acme Corp",
      "INV-2025-001",
      "Bank Transfer",
      "Completed"
    ];
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      sampleData.join(",")
    ].join("\n");
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.setAttribute("href", url);
    link.setAttribute("download", "invoice_template.csv");
    link.style.visibility = "hidden";
    
    // Append to document, click to download, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const count = await upload(file);
      setUploadedCount(count);
      setUploadStatus("success");
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus("error");
    }
  };

  const expectedColumns = [
    "Transactio",
    "Date",
    "Amount",
    "Category",
    "Account",
    "Descriptio",
    "Client",
    "Invoice ID",
    "Payment M",
    "Status"
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h1 className="text-3xl font-bold">Upload Finance Data</h1>
          <Badge variant="secondary">Finance</Badge>
        </div>
        <p className="text-muted-foreground">Upload Excel files to update financial records and reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
            <CardDescription>Select an Excel file (.xlsx, .xls) containing financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file" className="flex items-center">
                <span>Upload Excel File</span>
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={uploading}
                className={`${!file && 'border-dashed border-gray-300'}`}
              />
              {!file && (
                <p className="text-xs text-muted-foreground mt-1">
                  Select an Excel file (.xlsx, .xls) or CSV file (.csv)
                </p>
              )}
              {file && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full sm:w-auto"
                variant={!file ? "outline" : "default"}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setFile(null);
                  setUploadStatus("idle");
                }}
                disabled={!file || uploading}
              >
                Clear
              </Button>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    {uploadProgress < 40 ? "Reading file..." : 
                     uploadProgress < 70 ? "Processing data..." : 
                     "Saving records..."}
                  </span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Success!</span> {uploadedCount} invoice {uploadedCount === 1 ? 'record' : 'records'} uploaded successfully.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Error:</span> {error || "An error occurred while uploading the file."}
                </AlertDescription>
              </Alert>
            )}
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
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    {column}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• First row should contain column headers</li>
                <li>• Date format: MM/DD/YYYY or YYYY-MM-DD</li>
                <li>• Rates and amounts should be numeric (no currency symbols)</li>
                <li>• Invoice Status: paid, pending, overdue, cancelled</li>
                <li>• Discount percentage should be a number between 0-100</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Tip:</strong> Download our template file to ensure proper formatting
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 bg-transparent"
                onClick={downloadTemplate}
              >
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>History of recent financial data uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { file: "invoices_june_2024.xlsx", date: "2024-06-30", records: 42, status: "success" },
              { file: "client_invoices_q2.xlsx", date: "2024-06-15", records: 78, status: "success" },
              { file: "pending_invoices.xlsx", date: "2024-06-01", records: 23, status: "error" },
            ].map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{upload.file}</p>
                    <p className="text-xs text-muted-foreground">
                      {upload.records} records • {upload.date}
                    </p>
                  </div>
                </div>
                <Badge variant={upload.status === "success" ? "default" : "destructive"}>
                  {upload.status === "success" ? "Success" : "Failed"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
