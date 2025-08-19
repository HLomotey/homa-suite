"use client";

import type React from "react";
import { useState } from "react";
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
  DollarSign,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useUploadFinanceTransactions } from "@/hooks/finance/useFinanceTransaction";
import { FrontendFinanceTransaction } from "@/integration/supabase/types/finance";

export default function UploadFinance() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const {
    upload,
    generateTemplate,
    loading: uploading,
    progress: uploadProgress,
    error,
  } = useUploadFinanceTransactions();

  // Function to generate and download an Excel template
  const downloadTemplate = async () => {
    try {
      console.log("Starting template download process");

      // Use our utility function to generate the template (now async)
      const templateBlob = await generateTemplate();

      // Check if we got a valid blob with content
      if (!templateBlob || templateBlob.size === 0) {
        console.error("Generated template blob is empty or invalid");
        setUploadStatus("error");
        return;
      }

      console.log(
        `Template generated successfully, size: ${templateBlob.size} bytes`
      );

      // Create a download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(templateBlob);

      // Set link properties
      link.setAttribute("href", url);
      link.setAttribute("download", "finance_transaction_template.xlsx");
      link.style.visibility = "hidden";

      // Append to document, click to download, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log("Finance transaction template downloaded successfully");
    } catch (err) {
      console.error("Error downloading template:", err);
      setUploadStatus("error");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    try {
      setUploadStatus("idle");
      const count = await upload(file);
      setUploadedCount(count);
      setUploadStatus("success");
      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById(
        "finance-file"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
    }
  };

  const expectedColumns = [
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
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h1 className="text-3xl font-bold">Upload Finance Invoices</h1>
          <Badge variant="secondary">Finance</Badge>
        </div>
        <p className="text-muted-foreground">
          Upload Excel files to update financial records and reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Finance Invoice Upload
            </CardTitle>
            <CardDescription>
              Upload invoice line items from Excel files. The system will
              process and validate the data before importing it.
            </CardDescription>
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
                className={`${!file && "border-dashed border-gray-300"}`}
              />
              {!file && (
                <p className="text-sm text-muted-foreground">
                  Upload an Excel file (.xlsx) with invoice line items data. The
                  file should have the following columns:
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
                    Upload Invoice Items
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
                    {uploadProgress < 40
                      ? "Reading file..."
                      : uploadProgress < 70
                      ? "Processing data..."
                      : "Saving records..."}
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
                  <span className="font-medium">Success!</span> {uploadedCount}{" "}
                  invoice line {uploadedCount === 1 ? "item" : "items"} uploaded
                  successfully.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Error:</span>{" "}
                  {error || "An error occurred while uploading the file."}
                </AlertDescription>
              </Alert>
            )}
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
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Required Columns:</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {expectedColumns.map((column, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
                    {column}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Guidelines:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• First row should contain column headers</li>
                <li>• Date format: MM/DD/YYYY or YYYY-MM-DD</li>
                <li>• Rate and quantities should be numeric values</li>
                <li>• Discount percentage should be between 0-100</li>
                <li>• Invoice Status: Pending, Paid, Overdue</li>
                <li>• Tax types should be GST, VAT, or Sales Tax</li>
                <li>
                  • Currency should be standard 3-letter code (USD, EUR, GBP)
                </li>
              </ul>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Tip:</strong> Download our template file to ensure
                proper formatting
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-transparent"
                onClick={downloadTemplate}
              >
                Download Invoice Line Items Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>
            History of recent transaction data uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                file: "transactions_june_2024.xlsx",
                date: "2024-06-30",
                records: 42,
                status: "success",
              },
              {
                file: "client_transactions_q2.xlsx",
                date: "2024-06-15",
                records: 78,
                status: "success",
              },
              {
                file: "pending_transactions.xlsx",
                date: "2024-06-01",
                records: 23,
                status: "error",
              },
            ].map((upload, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{upload.file}</p>
                    <p className="text-xs text-muted-foreground">
                      {upload.records} records • {upload.date}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    upload.status === "success" ? "default" : "destructive"
                  }
                >
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
