import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBulkCreatePayrollDeductions } from "@/hooks/payroll-deductions/usePayrollDeductions";
import { CreatePayrollDeduction } from "@/integration/supabase/types/payroll-deductions";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Eye } from "lucide-react";
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
  const [previewData, setPreviewData] = useState<CreatePayrollDeduction[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const bulkCreateMutation = useBulkCreatePayrollDeductions();

  const expectedColumns = [
    "Position ID",
    "BCD_Bus Card_Deduction",
    "Security_Deposit_Deduction",
    "RNT_Rent_Deduction",
    "TRN_Transport Subs_Deduction",
    "start_period",
    "end_period",
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
        setPreviewData([]);
        setShowPreview(false);
      } else {
        toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      }
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Starting file preview...");
      const deductions = await parseExcelFile(file);
      console.log("Preview data parsed:", deductions);
      
      setPreviewData(deductions);
      setShowPreview(true);
      toast.success(`Preview loaded: ${deductions.length} records found`);
    } catch (error: any) {
      console.error("Preview error:", error);
      toast.error(`Failed to preview file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseExcelFile = async (file: File): Promise<CreatePayrollDeduction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          
          console.log("Workbook loaded. Available sheets:", workbook.SheetNames);
          
          const sheetName = workbook.SheetNames[0];
          console.log("Using sheet:", sheetName);
          
          const worksheet = workbook.Sheets[sheetName];
          
          // Get the range of the worksheet
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
          console.log("Worksheet range:", worksheet['!ref']);
          console.log("Total rows in sheet:", range.e.r + 1);
          console.log("Total columns in sheet:", range.e.c + 1);
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: "", // Set default value for empty cells
            blankrows: false // Skip completely blank rows
          });

          console.log("Excel data parsed:", jsonData);
          console.log("Total rows found:", jsonData.length);
          console.log("First row columns:", jsonData[0] ? Object.keys(jsonData[0]) : "No data");
          console.log("Sample of first 5 rows:", jsonData.slice(0, 5));

          // Filter out rows that are completely empty or have no Position ID
          const validRows = jsonData.filter((row: any, index: number) => {
            const hasData = Object.values(row).some(value => 
              value !== null && value !== undefined && value !== ""
            );
            
            if (!hasData) {
              console.log(`Skipping empty row ${index + 1}`);
              return false;
            }
            
            return true;
          });

          console.log("Valid rows after filtering:", validRows.length);

          const deductions: CreatePayrollDeduction[] = validRows.map((row: any, index: number) => {
            console.log(`Processing row ${index + 1}:`, row);
            
            // Try different possible column name variations
            const getColumnValue = (possibleNames: string[], logName: string) => {
              for (const name of possibleNames) {
                if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
                  console.log(`Found ${logName} in column "${name}":`, row[name]);
                  return row[name];
                }
              }
              console.log(`${logName} not found in any of these columns:`, possibleNames);
              console.log("Available columns in this row:", Object.keys(row));
              return "";
            };
            
            const deduction = {
              position_id: getColumnValue([
                "Position ID", "position_id", "POSITION_ID", "PositionID", 
                "Position_ID", "POSITION ID", "Pos ID", "PosID"
              ], "Position ID"),
              bcd_bus_card_deduction: parseFloat(getColumnValue([
                "BCD_Bus Card_Deduction", "BCD_Bus_Card_Deduction", "Bus Card Deduction",
                "BCD Bus Card Deduction", "Bus_Card_Deduction", "BusCardDeduction"
              ], "Bus Card Deduction") || "0"),
              hdd_hang_dep_ded_deduction: parseFloat(getColumnValue([
                "HDD_Hang Dep Ded_Deduction", "HDD_Hang_Dep_Ded_Deduction", "Security Deposit Deduction",
                "HDD Hang Dep Ded Deduction", "Hang_Dep_Ded_Deduction", "HangDepDedDeduction", "Security_Deposit_Deduction"
              ], "Security Deposit Deduction") || "0"),
              rnt_rent_deduction: parseFloat(getColumnValue([
                "RNT_Rent_Deduction", "RNT_Rent_Deduction", "Rent Deduction",
                "RNT Rent Deduction", "Rent_Deduction", "RentDeduction"
              ], "Rent Deduction") || "0"),
              trn_transport_subs_deduction: parseFloat(getColumnValue([
                "TRN_Transport Subs_Deduction", "TRN_Transport_Subs_Deduction", "Transport Deduction",
                "TRN Transport Subs Deduction", "Transport_Subs_Deduction", "TransportSubsDeduction"
              ], "Transport Deduction") || "0"),
              start_period: formatDate(getColumnValue([
                "start_period", "Start Period", "START_PERIOD", "startPeriod",
                "Start_Period", "START PERIOD", "Start Date", "StartDate"
              ], "Start Period") || ""),
              end_period: formatDate(getColumnValue([
                "end_period", "End Period", "END_PERIOD", "endPeriod",
                "End_Period", "END PERIOD", "End Date", "EndDate"
              ], "End Period") || ""),
            };
            
            console.log(`Mapped deduction for row ${index + 1}:`, deduction);
            return deduction;
          });

          console.log("All deductions mapped:", deductions);
          resolve(deductions);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString || dateString.trim() === "") {
        return "";
      }

      console.log("Formatting date:", dateString);

      // Handle Excel serial date numbers
      if (!isNaN(Number(dateString))) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + Number(dateString) * 86400000);
        const formatted = date.toISOString().split("T")[0];
        console.log("Excel serial date converted:", dateString, "->", formatted);
        return formatted;
      }

      // Handle MM/DD/YYYY format
      if (dateString.includes("/")) {
        const [month, day, year] = dateString.split("/");
        const formatted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        console.log("MM/DD/YYYY format converted:", dateString, "->", formatted);
        return formatted;
      }

      // Handle YYYY-MM-DD format (already correct)
      if (dateString.includes("-") && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log("YYYY-MM-DD format (already correct):", dateString);
        return dateString;
      }

      // Try to parse as a regular date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const formatted = date.toISOString().split("T")[0];
        console.log("Generic date parsed:", dateString, "->", formatted);
        return formatted;
      }

      console.warn("Could not format date:", dateString);
      return dateString;
    } catch (error) {
      console.error("Date formatting error:", error, "for input:", dateString);
      return dateString;
    }
  };

  const handleUpload = async () => {
    if (!file && previewData.length === 0) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setUploadResults(null);

    try {
      // Use preview data if available, otherwise parse the file
      let deductions: CreatePayrollDeduction[];
      if (previewData.length > 0) {
        console.log("Using preview data for upload...");
        deductions = previewData;
      } else {
        console.log("Starting file parsing...");
        deductions = await parseExcelFile(file!);
      }
      console.log("Deductions ready for upload:", deductions.length);

      if (deductions.length === 0) {
        toast.error("No valid data found in the file");
        setIsProcessing(false);
        return;
      }

      // Validate required fields
      console.log("Starting validation...");
      const errors: string[] = [];
      deductions.forEach((deduction, index) => {
        if (!deduction.position_id) {
          errors.push(`Row ${index + 2}: Position ID is required`);
        }
        if (!deduction.start_period) {
          errors.push(`Row ${index + 2}: start_period is required`);
        }
        if (!deduction.end_period) {
          errors.push(`Row ${index + 2}: end_period is required`);
        }
      });

      console.log("Validation completed. Errors found:", errors.length);

      if (errors.length > 0) {
        console.log("Validation errors:", errors);
        setUploadResults({
          success: 0,
          failed: errors.length,
          errors: errors.slice(0, 10), // Show first 10 errors
        });
        setIsProcessing(false);
        return;
      }

      // Upload to database
      console.log("Starting database upload...");
      console.log("Deductions to upload:", deductions);
      await bulkCreateMutation.mutateAsync(deductions);
      console.log("Database upload completed successfully");

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
      console.error("Error details:", error.stack);
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
        "Position ID": "04000255",
        "BCD_Bus Card_Deduction": "50.00",
        "Security_Deposit_Deduction": "50.00",
        "RNT_Rent_Deduction": "225.00",
        "TRN_Transport Subs_Deduction": "225.00",
        "start_period": "2025-01-01",
        "end_period": "2025-12-31",
      },
      {
        "Position ID": "04000256",
        "BCD_Bus Card_Deduction": "50.00",
        "Security_Deposit_Deduction": "0.00",
        "RNT_Rent_Deduction": "200.00",
        "TRN_Transport Subs_Deduction": "200.00",
        "start_period": "2025-01-01",
        "end_period": "2025-12-31",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Deductions");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 15 }, // Position ID
      { wch: 25 }, // BCD_Bus Card_Deduction
      { wch: 30 }, // Security_Deposit_Deduction
      { wch: 20 }, // RNT_Rent_Deduction
      { wch: 30 }, // TRN_Transport Subs_Deduction
      { wch: 15 }, // start_period
      { wch: 15 }, // end_period
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
              <li>Position ID, start_period and end_period are required for each record</li>
              <li>Deduction amounts should be numeric values (e.g., 50.00, 225.00)</li>
              <li>Date format: YYYY-MM-DD or MM/DD/YYYY</li>
              <li>Use 0.00 for deductions that don't apply to a position</li>
              <li>Position ID should match existing position records</li>
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

            <div className="flex gap-2">
              <Button
                onClick={handlePreview}
                disabled={!file || isProcessing}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </>
                )}
              </Button>

              <Button
                onClick={handleUpload}
                disabled={!file || isProcessing}
                className="flex-1 sm:flex-none"
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
          </div>

          {/* Data Preview */}
          {showPreview && previewData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Data Preview ({previewData.length} records)</h3>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="ghost"
                  size="sm"
                >
                  Hide Preview
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position ID</TableHead>
                        <TableHead className="text-right">Bus Card</TableHead>
                        <TableHead className="text-right">Security Deposit</TableHead>
                        <TableHead className="text-right">Rent</TableHead>
                        <TableHead className="text-right">Transport</TableHead>
                        <TableHead>Start Period</TableHead>
                        <TableHead>End Period</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 10).map((deduction, index) => {
                        const total = 
                          (deduction.bcd_bus_card_deduction || 0) +
                          (deduction.hdd_hang_dep_ded_deduction || 0) +
                          (deduction.rnt_rent_deduction || 0) +
                          (deduction.trn_transport_subs_deduction || 0);

                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {deduction.position_id || <span className="text-red-500">Missing</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              ${(deduction.bcd_bus_card_deduction || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ${(deduction.hdd_hang_dep_ded_deduction || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ${(deduction.rnt_rent_deduction || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ${(deduction.trn_transport_subs_deduction || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {deduction.start_period || <span className="text-red-500">Missing</span>}
                            </TableCell>
                            <TableCell>
                              {deduction.end_period || <span className="text-red-500">Missing</span>}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              ${total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {previewData.length > 10 && (
                  <div className="p-3 bg-muted text-sm text-muted-foreground text-center">
                    Showing first 10 of {previewData.length} records
                  </div>
                )}
              </div>

              {/* Validation Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Validation Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Total Records</div>
                    <div className="font-bold">{previewData.length}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Missing Position ID</div>
                    <div className="font-bold text-red-600">
                      {previewData.filter(d => !d.position_id).length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Missing Start Period</div>
                    <div className="font-bold text-red-600">
                      {previewData.filter(d => !d.start_period).length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Missing End Period</div>
                    <div className="font-bold text-red-600">
                      {previewData.filter(d => !d.end_period).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
