import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExternalStaff } from '@/hooks/external-staff/useExternalStaff';
import { FrontendExternalStaff, CreateExternalStaff } from '@/integration/supabase/types/external-staff';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { normalizeGender } from '@/utils/gender-normalizer';
import { normalizeDate, formatDate } from '@/utils/date-normalizer';

interface ExternalStaffExcelUploadProps {
  onClose: () => void;
}

interface ProcessedData {
  success: boolean;
  data?: CreateExternalStaff[];
  errors?: string[];
  warnings?: string[];
  totalRows: number;
  processedRows: number;
}

export function ExternalStaffExcelUpload({ onClose }: ExternalStaffExcelUploadProps) {
  const { bulkUpsertExternalStaff } = useExternalStaff();
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

  const processExcelFile = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      setProgress(25);

      if (!rawData || rawData.length === 0) {
        throw new Error('No data found in the Excel file');
      }

      setProgress(50);

      // Process the data according to the exact column structure
      const processedStaff: CreateExternalStaff[] = [];
      const errors: string[] = [];

      rawData.forEach((row: any, index) => {
        const rowNumber = index + 1;
        try {
          const staff: CreateExternalStaff = {
            "PAYROLL FIRST NAME": row["PAYROLL FIRST NAME"] || null,
            "PAYROLL LAST NAME": row["PAYROLL LAST NAME"] || null,
            "PAYROLL MIDDLE NAME": row["PAYROLL MIDDLE NAME"] || null,
            "GENERATION SUFFIX": row["GENERATION SUFFIX"] || null,
            "GENDER (SELF-ID)": normalizeGender(row["GENDER (SELF-ID)"]),
            "BIRTH DATE": normalizeDate(row["BIRTH DATE"]),
            "PRIMARY ADDRESS LINE 1": row["PRIMARY ADDRESS LINE 1"] || null,
            "PRIMARY ADDRESS LINE 2": row["PRIMARY ADDRESS LINE 2"] || null,
            "PRIMARY ADDRESS LINE 3": row["PRIMARY ADDRESS LINE 3"] || null,
            "LIVED-IN STATE": row["LIVED-IN STATE"] || null,
            "WORKED IN STATE": row["WORKED IN STATE"] || null,
            "PERSONAL E-MAIL": row["PERSONAL E-MAIL"] || null,
            "WORK E-MAIL": row["WORK E-MAIL"] || null,
            "HOME PHONE": row["HOME PHONE"] || null,
            "WORK PHONE": row["WORK PHONE"] || null,
            "POSITION ID": row["POSITION ID"] || null,
            "ASSOCIATE ID": row["ASSOCIATE ID"] || null,
            "FILE NUMBER": row["FILE NUMBER"] || null,
            "COMPANY CODE": row["COMPANY CODE"] || null,
            "JOB TITLE": row["JOB TITLE"] || null,
            "BUSINESS UNIT": row["BUSINESS UNIT"] || null,
            "HOME DEPARTMENT": row["HOME DEPARTMENT"] || null,
            "LOCATION": row["LOCATION"] || null,
            "WORKER CATEGORY": row["WORKER CATEGORY"] || null,
            "POSITION STATUS": row["POSITION STATUS"] || null,
            "HIRE DATE": row["HIRE DATE"] || null,
            "REHIRE DATE": row["REHIRE DATE"] || null,
            "TERMINATION DATE": row["TERMINATION DATE"] || null,
            "YEARS OF SERVICE": row["YEARS OF SERVICE"] || null,
            "REPORTS TO NAME": row["REPORTS TO NAME"] || null,
            "JOB CLASS": row["JOB CLASS"] || null,
          };

          // Basic validation - require both first name and last name
          if (!staff["PAYROLL FIRST NAME"] || !staff["PAYROLL LAST NAME"]) {
            errors.push(`Row ${rowNumber}: Both payroll first name and last name are required`);
            return;
          }

          processedStaff.push(staff);
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      setProgress(75);

      const result: ProcessedData = {
        success: errors.length === 0,
        data: processedStaff,
        errors: errors.length > 0 ? errors : undefined,
        totalRows: rawData.length,
        processedRows: processedStaff.length,
      };

      setProcessedData(result);
      setProgress(100);

      if (result.success) {
        toast.success(`Successfully processed ${result.processedRows} records`);
      } else {
        toast.warning(`Processed ${result.processedRows} of ${result.totalRows} records with ${errors.length} errors`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process Excel file';
      setProcessedData({
        success: false,
        errors: [errorMessage],
        totalRows: 0,
        processedRows: 0,
      });
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!processedData?.data || processedData.data.length === 0) return;

    setUploading(true);
    try {
      await bulkUpsertExternalStaff(processedData.data);
      toast.success('External staff data uploaded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to upload external staff data');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      'PAYROLL LAST NAME': 'Smith',
      'PAYROLL FIRST NAME': 'John',
      'PAYROLL MIDDLE NAME': 'Michael',
      'GENERATION SUFFIX': 'Jr.',
      'GENDER (SELF-ID)': 'Man',
      'BIRTH DATE': '06/15/XXXX',
      'PRIMARY ADDRESS LINE 1': '123 Oak Street',
      'PRIMARY ADDRESS LINE 2': 'Apt 4B',
      'PRIMARY ADDRESS LINE 3': '',
      'LIVED-IN STATE': 'PA',
      'WORKED IN STATE': 'PA',
      'PERSONAL E-MAIL': 'john.smith@personal.com',
      'WORK E-MAIL': 'john.smith@company.com',
      'HOME PHONE': '215-555-1234',
      'WORK PHONE': '215-555-5678',
      'POSITION ID': 'P12345',
      'ASSOCIATE ID': 'A98765',
      'FILE NUMBER': 'F001234',
      'COMPANY CODE': 'COMP123',
      'JOB TITLE': 'Senior Teacher',
      'BUSINESS UNIT': 'Education',
      'HOME DEPARTMENT': 'Mathematics',
      'LOCATION': 'Philadelphia',
      'WORKER CATEGORY': 'Full-time',
      'POSITION STATUS': 'Active',
      'HIRE DATE': '2022-08-15',
      'REHIRE DATE': '',
      'TERMINATION DATE': '',
      'YEARS OF SERVICE': '3.2',
      'REPORTS TO NAME': 'Sarah Johnson, Department Head',
      'JOB CLASS': 'Faculty',
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Information Template');
    XLSX.writeFile(workbook, 'external_staff_template.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Import Staff Information from Excel</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Download Template</p>
                <p className="text-sm text-muted-foreground">
                  Get the Excel template with the correct column structure. Only first name and last name are required.
                  <br />
                  <strong>Note:</strong> Changes to JOB TITLE, HOME DEPARTMENT, LOCATION, or POSITION STATUS will archive existing records to history.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Select Excel file for staff information import"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 border-dashed"
              >
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  <p>Click to select Excel file</p>
                  <p className="text-sm text-muted-foreground">Supports .xlsx and .xls files</p>
                </div>
              </Button>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={processExcelFile}
                  disabled={processing}
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
              <Alert className={processedData.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center space-x-2">
                  {processedData.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {processedData.success
                      ? `Successfully processed ${processedData.processedRows} of ${processedData.totalRows} records`
                      : `Processed ${processedData.processedRows} of ${processedData.totalRows} records with errors`}
                  </AlertDescription>
                </div>
              </Alert>

              {processedData.errors && processedData.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {processedData.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {processedData.data && processedData.data.length > 0 && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Uploading...' : `Upload ${processedData.data.length} Records`}
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
