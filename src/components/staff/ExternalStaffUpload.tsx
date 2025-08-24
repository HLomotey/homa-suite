import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ExternalStaffRecord, 
  transformExternalStaffBatch,
  validateExternalStaffRecord 
} from '@/integration/supabase/types/external-staff-mapping';
import { useCreateStaff } from '@/hooks/billing/useStaff';
import * as XLSX from 'xlsx';

interface UploadResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    record: ExternalStaffRecord;
    errors: string[];
  }>;
}

export const ExternalStaffUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<ExternalStaffRecord[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();
  const { create: createStaff } = useCreateStaff();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
      setPreviewData([]);
      setShowPreview(false);
      
      // Parse file for preview
      parseFileForPreview(selectedFile);
    }
  }, []);

  const parseFileForPreview = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExternalStaffRecord[];
      
      // Take first 5 records for preview
      setPreviewData(jsonData.slice(0, 5));
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "File Parse Error",
        description: "Unable to parse the selected file. Please ensure it's a valid Excel or CSV file.",
        variant: "destructive",
      });
    }
  };

  const processUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Parse the entire file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExternalStaffRecord[];

      // Transform and validate data
      const { validRecords, invalidRecords } = transformExternalStaffBatch(jsonData);
      
      let successCount = 0;
      const errors: UploadResult['errors'] = [];

      // Add validation errors to results
      invalidRecords.forEach((invalid, index) => {
        errors.push({
          row: index + 2, // +2 for header row and 0-based index
          record: invalid.record,
          errors: invalid.errors
        });
      });

      // Process valid records
      for (let i = 0; i < validRecords.length; i++) {
        const validRecord = validRecords[i];
        try {
          await createStaff({
            ...validRecord,
            id: crypto.randomUUID(), // Generate new ID
          } as any);
          
          successCount++;
          setUploadProgress(((i + 1) / validRecords.length) * 100);
        } catch (error) {
          const originalIndex = jsonData.findIndex(original => 
            original.EMPLOYEE_ID === validRecord.employee_id
          );
          
          errors.push({
            row: originalIndex + 2,
            record: jsonData[originalIndex],
            errors: [`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`]
          });
        }
      }

      const result: UploadResult = {
        totalRecords: jsonData.length,
        successCount,
        errorCount: errors.length,
        errors
      };

      setUploadResult(result);

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} staff records.`,
        });
      }

      if (errors.length > 0) {
        toast({
          title: "Upload Warnings",
          description: `${errors.length} records had errors and were not uploaded.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    // Template data matching the exact structure from your external system sample
    const templateData = [{
      EMPLOYEE_ID: 'EMP001',
      FIRST_NAME: 'John',
      LAST_NAME: 'Doe',
      MIDDLE_NAME: 'Michael',
      GENDER: 'Male',
      MARITAL_STATUS: 'Single',
      DATE_OF_BIRTH: '1990-01-15',
      EMAIL: 'john.doe@company.com',
      PHONE_NUMBER: '+1234567890',
      ADDRESS: '123 Main St',
      CITY: 'Anytown',
      STATE: 'CA',
      ZIP_CODE: '12345',
      COUNTRY: 'USA',
      DEPARTMENT: 'Engineering',
      POSITION: 'Software Developer',
      EMPLOYMENT_STATUS: 'Active',
      HIRE_DATE: '2023-01-01',
      TERMINATION_DATE: '',
      SUPERVISOR: 'Jane Smith',
      WORK_LOCATION: 'Main Office',
      SALARY: 75000,
      HOURLY_RATE: '',
      PAY_FREQUENCY: 'Monthly',
      EMERGENCY_CONTACT_NAME: 'Jane Doe',
      EMERGENCY_CONTACT_PHONE: '+1234567891',
      EMERGENCY_CONTACT_RELATIONSHIP: 'Spouse',
      ETHNICITY_RACE: 'Caucasian',
      VETERAN_STATUS: 'No',
      DISABILITY_STATUS: 'No',
      EMPLOYEE_TYPE: 'Full-time',
      SHIFT: 'Day',
      COST_CENTER: 'ENG001',
      MANAGER: 'Jane Smith',
      START_TIME: '09:00',
      END_TIME: '17:00',
      BENEFITS_ELIGIBLE: 'Yes',
      UNION_MEMBER: 'No',
      JOB_CODE: 'DEV001',
      GRADE_LEVEL: 'L3',
      STEP: '1',
      FTE: 1.0,
      PROBATION_END_DATE: '2023-07-01',
      LAST_REVIEW_DATE: '2023-12-01',
      NEXT_REVIEW_DATE: '2024-12-01',
      NOTES: 'Sample employee record'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Template');
    XLSX.writeFile(wb, 'external_staff_template.xlsx');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            External Staff Data Upload
          </CardTitle>
          <CardDescription>
            Upload staff data from your external system using the exact field structure.
            This tool will automatically map and transform the data to match your internal system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Download Template</h4>
              <p className="text-sm text-muted-foreground">
                Get the exact Excel template with all required field names
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <FileText className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select Staff Data File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* File Preview */}
          {showPreview && previewData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Data Preview (First 5 Records)</h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left">Employee ID</th>
                        <th className="px-2 py-1 text-left">First Name</th>
                        <th className="px-2 py-1 text-left">Last Name</th>
                        <th className="px-2 py-1 text-left">Email</th>
                        <th className="px-2 py-1 text-left">Department</th>
                        <th className="px-2 py-1 text-left">Position</th>
                        <th className="px-2 py-1 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((record, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-2 py-1">{record.EMPLOYEE_ID}</td>
                          <td className="px-2 py-1">{record.FIRST_NAME}</td>
                          <td className="px-2 py-1">{record.LAST_NAME}</td>
                          <td className="px-2 py-1">{record.EMAIL}</td>
                          <td className="px-2 py-1">{record.DEPARTMENT}</td>
                          <td className="px-2 py-1">{record.POSITION}</td>
                          <td className="px-2 py-1">
                            <Badge variant={validateExternalStaffRecord(record).isValid ? "default" : "destructive"}>
                              {validateExternalStaffRecord(record).isValid ? "Valid" : "Invalid"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Button */}
          <Button 
            onClick={processUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Staff Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.errorCount === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{uploadResult.totalRecords}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uploadResult.successCount}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{uploadResult.errorCount}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Error Details */}
            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Error Details</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {uploadResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Row {error.row}:</strong> {error.record.FIRST_NAME} {error.record.LAST_NAME}
                        <ul className="mt-1 ml-4 list-disc">
                          {error.errors.map((err, errIndex) => (
                            <li key={errIndex} className="text-sm">{err}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
