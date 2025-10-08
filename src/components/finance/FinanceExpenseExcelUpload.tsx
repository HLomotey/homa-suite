import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBulkCreateFinanceExpenses } from '@/hooks/finance';
import { FrontendFinanceExpense } from '@/integration/supabase/types/finance';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { readExcelFile } from '@/utils/excelJSHelper';
import * as ExcelJS from 'exceljs';

interface FinanceExpenseExcelUploadProps {
  onClose: () => void;
}

interface ProcessedData {
  success: boolean;
  data?: Omit<FrontendFinanceExpense, 'id' | 'createdAt' | 'updatedAt'>[];
  errors?: string[];
  warnings?: string[];
  totalRows: number;
  processedRows: number;
}

export function FinanceExpenseExcelUpload({ onClose }: FinanceExpenseExcelUploadProps) {
  const bulkCreateMutation = useBulkCreateFinanceExpenses();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProcessedData(null);
    }
  };

  const validateExpenseData = (row: any, rowNumber: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields validation
    if (!row.Company) {
      errors.push(`Row ${rowNumber}: Company is required`);
    }
    if (!row.Date) {
      errors.push(`Row ${rowNumber}: Date is required`);
    }
    if (!row.Type) {
      errors.push(`Row ${rowNumber}: Type is required`);
    }
    if (!row.Payee) {
      errors.push(`Row ${rowNumber}: Payee is required`);
    }
    if (!row.Category) {
      errors.push(`Row ${rowNumber}: Category is required`);
    }
    if (!row.Total && row.Total !== 0) {
      errors.push(`Row ${rowNumber}: Total is required`);
    }

    // Data type validation
    if (row.Total && isNaN(parseFloat(row.Total))) {
      errors.push(`Row ${rowNumber}: Total must be a valid number`);
    }

    // Date validation
    if (row.Date) {
      const date = new Date(row.Date);
      if (isNaN(date.getTime())) {
        errors.push(`Row ${rowNumber}: Date must be a valid date`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '';
    
    // Handle Excel serial date numbers
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Handle string dates
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateValue.toString();
  };

  const processExcelFile = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const fileBuffer = await file.arrayBuffer();
      const { data: jsonData } = await readExcelFile(fileBuffer);

      setProgress(25);

      if (!jsonData || jsonData.length === 0) {
        throw new Error('No data found in the Excel file');
      }

      setProgress(50);

      // Process the data according to the exact column structure
      const processedExpenses: Omit<FrontendFinanceExpense, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      jsonData.forEach((row: any, index) => {
        const rowNumber = index + 1;
        
        // Validate the row data
        const validation = validateExpenseData(row, rowNumber);
        if (!validation.isValid) {
          errors.push(...validation.errors);
          return;
        }

        try {
          const expense: Omit<FrontendFinanceExpense, 'id' | 'createdAt' | 'updatedAt'> = {
            company: row.Company?.toString().trim() || '',
            date: formatDate(row.Date),
            type: row.Type?.toString().trim() || '',
            payee: row.Payee?.toString().trim() || '',
            category: row.Category?.toString().trim() || '',
            total: parseFloat(row.Total) || 0
          };

          processedExpenses.push(expense);
        } catch (error) {
          errors.push(`Row ${rowNumber}: Error processing data - ${error}`);
        }
      });

      setProgress(75);

      const result: ProcessedData = {
        success: errors.length === 0,
        data: processedExpenses,
        errors,
        warnings,
        totalRows: jsonData.length,
        processedRows: processedExpenses.length
      };

      setProcessedData(result);
      setProgress(100);

      if (result.success) {
        toast.success(`Successfully processed ${result.processedRows} expense records`);
      } else {
        toast.error(`Processing completed with ${errors.length} errors`);
      }

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error(`Failed to process Excel file: ${error}`);
      setProcessedData({
        success: false,
        errors: [`Failed to process Excel file: ${error}`],
        totalRows: 0,
        processedRows: 0
      });
    } finally {
      setProcessing(false);
    }
  };

  const uploadData = async () => {
    if (!processedData?.data || processedData.data.length === 0) return;

    setUploading(true);
    try {
      await bulkCreateMutation.mutateAsync(processedData.data);
      toast.success(`Successfully uploaded ${processedData.data.length} finance expenses`);
      onClose();
    } catch (error) {
      console.error('Error uploading data:', error);
      toast.error(`Failed to upload data: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Finance Expenses Template');

    // Add headers
    worksheet.columns = [
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Payee', key: 'payee', width: 25 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Total', key: 'total', width: 12 }
    ];

    // Add sample data
    worksheet.addRow({
      company: 'BOHCONCEPTSNEM LLC',
      date: '2025-08-11',
      type: 'Expense',
      payee: 'Sample Vendor',
      category: 'Office Supplies',
      total: 100.00
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_expenses_template.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Finance Expenses
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Download Template</h3>
                <p className="text-sm text-blue-700">Get the Excel template with the correct format</p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              Download
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-file-upload"
                aria-label="Upload Excel file for expense data"
              />
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Choose Excel file to upload
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Select an Excel file (.xlsx or .xls) with finance expense data
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Select File
              </Button>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button
                  onClick={processExcelFile}
                  disabled={processing}
                  size="sm"
                >
                  {processing ? 'Processing...' : 'Process File'}
                </Button>
              </div>
            )}
          </div>

          {/* Progress */}
          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing file...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {processedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {processedData.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className="font-medium">
                  Processing {processedData.success ? 'Completed' : 'Failed'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Rows:</span>
                  <span className="ml-2 font-medium">{processedData.totalRows}</span>
                </div>
                <div>
                  <span className="text-gray-600">Processed:</span>
                  <span className="ml-2 font-medium">{processedData.processedRows}</span>
                </div>
              </div>

              {processedData.errors && processedData.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Errors found:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {processedData.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {processedData.errors.length > 5 && (
                          <li>... and {processedData.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {processedData.warnings && processedData.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Warnings:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {processedData.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {processedData.success && processedData.data && processedData.data.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={uploadData}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? 'Uploading...' : `Upload ${processedData.data.length} Records`}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
