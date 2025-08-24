import React, { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Users,
  FileText
} from 'lucide-react';
import { 
  processExternalStaffExcelData,
  generateExternalStaffExcelTemplate,
  validateExternalStaffExcelStructure,
  ExternalStaffExcelProcessingResult
} from '../../utils/externalStaffExcelProcessor';
import { useBulkCreateExternalStaff } from '../../hooks/external-staff/useExternalStaff';
import { CreateExternalStaff } from '../../integration/supabase/types/external-staff';

interface ExternalStaffExcelUploadProps {
  onUploadComplete?: (result: ExternalStaffExcelProcessingResult) => void;
}

export const ExternalStaffExcelUpload: React.FC<ExternalStaffExcelUploadProps> = ({
  onUploadComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<ExternalStaffExcelProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { bulkCreate, loading: isUploading } = useBulkCreateExternalStaff();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProcessingResult(null);
      processExcelFile(selectedFile);
    }
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        setProcessingResult({
          success: false,
          errors: ['Excel file is empty'],
          totalRows: 0,
          processedRows: 0
        });
        return;
      }

      // Get headers and validate structure
      const headers = jsonData[0] as string[];
      const structureValidation = validateExternalStaffExcelStructure(headers);
      
      if (!structureValidation.isValid) {
        setProcessingResult({
          success: false,
          errors: [
            `Missing required columns: ${structureValidation.missingColumns.join(', ')}`,
            ...(structureValidation.extraColumns.length > 0 
              ? [`Extra columns found: ${structureValidation.extraColumns.join(', ')}`]
              : []
            )
          ],
          totalRows: jsonData.length - 1,
          processedRows: 0
        });
        return;
      }

      // Convert array data to object format
      const objectData = jsonData.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      // Process the data
      const result = processExternalStaffExcelData(objectData);
      setProcessingResult(result);
      
    } catch (error) {
      setProcessingResult({
        success: false,
        errors: [`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        totalRows: 0,
        processedRows: 0
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadToDatabase = async () => {
    if (!processingResult?.data || processingResult.data.length === 0) {
      return;
    }

    try {
      setUploadProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await bulkCreate(processingResult.data);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Call completion callback
      onUploadComplete?.(processingResult);
      
      // Reset form
      setTimeout(() => {
        setFile(null);
        setProcessingResult(null);
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      setUploadProgress(0);
      console.error('Upload failed:', error);
    }
  };

  const downloadTemplate = () => {
    const template = generateExternalStaffExcelTemplate();
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      template.headers,
      template.sampleData
    ]);
    
    XLSX.utils.book_append_sheet(wb, ws, 'External Staff Template');
    
    // Download
    XLSX.writeFile(wb, 'external_staff_template.xlsx');
  };

  const resetUpload = () => {
    setFile(null);
    setProcessingResult(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">External Staff Import</h2>
          <p className="text-muted-foreground">
            Import external staff data with exact 31-column structure
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Upload an Excel file with external staff data. The file must match the exact 31-column structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onClick={openFileDialog}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-muted-foreground/25 hover:border-primary/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div>
                <p className="text-lg mb-2">Click to select an Excel file</p>
                <p className="text-sm text-muted-foreground">
                  Supports .xlsx, .xls, and .csv files
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button onClick={resetUpload} variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Processing Excel file...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Results */}
      {processingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {processingResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{processingResult.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{processingResult.processedRows}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {processingResult.errors?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {processingResult.warnings?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>

            {/* Errors */}
            {processingResult.errors && processingResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errors found:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {processingResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {processingResult.warnings && processingResult.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {processingResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            {processingResult.success && processingResult.data && processingResult.data.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">
                      Ready to upload {processingResult.data.length} staff records
                    </span>
                  </div>
                  <Button 
                    onClick={handleUploadToDatabase}
                    disabled={isUploading}
                    className="min-w-[120px]"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload to Database
                      </>
                    )}
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <div>
              <p className="font-medium">Download Template</p>
              <p className="text-sm text-muted-foreground">
                Click "Download Template" to get the Excel file with exact column structure
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <div>
              <p className="font-medium">Fill Data</p>
              <p className="text-sm text-muted-foreground">
                Fill in your external staff data using the exact column names and order
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <div>
              <p className="font-medium">Upload File</p>
              <p className="text-sm text-muted-foreground">
                Upload your completed Excel file for validation and import
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <div>
              <p className="font-medium">Review & Import</p>
              <p className="text-sm text-muted-foreground">
                Review the processing results and click "Upload to Database" to complete the import
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
