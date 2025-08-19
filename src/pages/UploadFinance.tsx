"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
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
    "Client Name",
    "Invoice Number",
    "Date Issued",
    "Invoice Status",
    "Date Paid",
    "Item Name",
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
    "Currency"
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
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
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
                <AlertDescription>File uploaded successfully! {uploadedCount} invoice records have been processed.</AlertDescription>
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
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
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
