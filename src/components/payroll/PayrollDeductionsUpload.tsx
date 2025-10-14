import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useBulkCreatePayrollDeductions } from "@/hooks/payroll-deductions/usePayrollDeductions";
import { CreatePayrollDeduction } from "@/integration/supabase/types/payroll-deductions";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const PayrollDeductionsUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const bulkCreateMutation = useBulkCreatePayrollDeductions();

  const expectedColumns = [
    "Payroll Name",
    "Payroll Company Code",
    "Location Description",
    "ADV_ADVANCE PAY_Deduction",
    "BCD_Bus Card_Deduction",
    "HDD_Drug Dep Dtet_Deduction",
    "RNT_Rent_Deduction",
    "TRN_Transport Subs_Deduction",
    "Position ID",
    "Start Period",
    "End Period",
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        setUploadResults(null);
      } else {
        toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      }
    }
  };

  const parseExcelFile = async (file: File): Promise<CreatePayrollDeduction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

          const deductions: CreatePayrollDeduction[] = jsonData.map((row: any) => ({
            payroll_name: row["Payroll Name"] || "",
            payroll_company_code: row["Payroll Company Code"] || null,
            location_description: row["Location Description"] || null,
            adv_advance_pay_deduction: parseFloat(row["ADV_ADVANCE PAY_Deduction"] || "0"),
            bcd_bus_card_deduction: parseFloat(row["BCD_Bus Card_Deduction"] || "0"),
            hdd_drug_dep_dtet_deduction: parseFloat(row["HDD_Drug Dep Dtet_Deduction"] || "0"),
            rnt_rent_deduction: parseFloat(row["RNT_Rent_Deduction"] || "0"),
            trn_transport_subs_deduction: parseFloat(row["TRN_Transport Subs_Deduction"] || "0"),
            position_id: row["Position ID"] || null,
            start_period: row["Start Period"] ? formatDate(row["Start Period"]) : null,
            end_period: row["End Period"] ? formatDate(row["End Period"]) : null,
          }));

          resolve(deductions);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const formatDate = (dateString: string): string => {
    try {
      // Handle Excel serial date numbers
      if (!isNaN(Number(dateString))) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + Number(dateString) * 86400000);
        return date.toISOString().split("T")[0];
      }

      // Handle MM/DD/YYYY format
      if (dateString.includes("/")) {
        const [month, day, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // Handle YYYY-MM-DD format
      if (dateString.includes("-")) {
        return dateString;
      }

      return dateString;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setUploadResults(null);

    try {
      const deductions = await parseExcelFile(file);

      if (deductions.length === 0) {
        toast.error("No valid data found in the file");
        setIsProcessing(false);
        return;
      }

      // Validate required fields
      const errors: string[] = [];
      deductions.forEach((deduction, index) => {
        if (!deduction.payroll_name) {
          errors.push(`Row ${index + 2}: Payroll Name is required`);
        }
      });

      if (errors.length > 0) {
        setUploadResults({
          success: 0,
          failed: errors.length,
          errors: errors.slice(0, 10), // Show first 10 errors
        });
        setIsProcessing(false);
        return;
      }

      // Upload to database
      await bulkCreateMutation.mutateAsync(deductions);

      setUploadResults({
        success: deductions.length,
        failed: 0,
        errors: [],
      });

      // Clear file input
      setFile(null);
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadResults({
        success: 0,
        failed: 1,
        errors: [error.message || "Failed to upload payroll deductions"],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Payroll Name": "OKYEAME, ANDREW OSEI",
        "Payroll Company Code": "YL5",
        "Location Description": "West Virginia | Chesapeake Bay",
        "ADV_ADVANCE PAY_Deduction": "50.00",
        "BCD_Bus Card_Deduction": "50.00",
        "HDD_Drug Dep Dtet_Deduction": "50.00",
        "RNT_Rent_Deduction": "225.00",
        "TRN_Transport Subs_Deduction": "225.00",
        "Position ID": "04000255",
        "Start Period": "2025-01-01",
        "End Period": "2025-12-31",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Deductions");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, "payroll_deductions_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Payroll Deductions Upload
              </CardTitle>
              <CardDescription>
                Upload Excel files to import payroll deduction records
              </CardDescription>
            </div>
            <Badge variant="outline">Payroll</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Expected Columns */}
          <div>
            <h3 className="text-sm font-medium mb-2">Expected Columns</h3>
            <div className="flex flex-wrap gap-2">
              {expectedColumns.map((column) => (
                <Badge key={column} variant="secondary">
                  {column}
                </Badge>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div>
            <h3 className="text-sm font-medium mb-2">Upload Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>First row should contain column headers (exact match required)</li>
              <li>Payroll Name is required for each record</li>
              <li>Deduction amounts should be numeric values (e.g., 50.00, 225.00)</li>
              <li>Date format: YYYY-MM-DD or MM/DD/YYYY</li>
              <li>Company codes should match existing codes in the system</li>
              <li>Maximum file size: 10MB</li>
              <li>Supported formats: .xlsx, .xls, .csv</li>
            </ul>
          </div>

          {/* Download Template */}
          <div>
            <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            {file && (
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Payroll Deductions
                </>
              )}
            </Button>
          </div>

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-2">
              {uploadResults.success > 0 && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully uploaded <strong>{uploadResults.success}</strong> payroll deduction records
                  </AlertDescription>
                </Alert>
              )}

              {uploadResults.failed > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{uploadResults.failed}</strong> records failed to upload
                    {uploadResults.errors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm">
                        {uploadResults.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
