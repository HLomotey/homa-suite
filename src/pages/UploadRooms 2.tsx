import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle, AlertCircle, Download, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import * as ExcelJS from 'exceljs';
import { bulkImportRooms } from "../hooks/room/api";

const UploadRooms = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    errors: string[];
  }>({ success: 0, errors: [] });

  const expectedColumns = [
    "Room Name", "Property ID", "Property Name", "Room Type", "Status",
    "Area (sq ft)", "Current Occupants", "Max Occupants", "Price", "Date Available"
  ];

  const guidelines = [
    "First row should contain column headers",
    "Date format: MM/DD/YYYY or YYYY-MM-DD",
    "Area and price should be numeric",
    "Room Type: Single, Double, Suite, or Studio",
    "Status: Available, Occupied, Maintenance, or Reserved",
    "Maximum file size: 10MB"
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
      setUploadResults({ success: 0, errors: [] });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Add very prominent console logs
    console.log("%c UPLOAD PROCESS STARTED ", "background: #ff0000; color: white; font-size: 20px;");
    console.log("File being uploaded:", file.name);
    
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("idle");

    try {
      // Read the Excel file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          console.log("%c FILE READER ONLOAD TRIGGERED ", "background: #00ff00; color: black; font-size: 20px;");
          const data = e.target?.result;
          console.log("Raw file data received", !!data);
          console.log("File data type:", typeof data);
          
          // Use ExcelJS to read the file
          const { data: jsonData } = await import('@/utils/excelJSHelper').then(async (module) => {
            return await module.readExcelFile(data as ArrayBuffer);
          });
          console.log("%c EXCEL WORKBOOK PROCESSED ", "background: #00aaff; color: white; font-size: 20px;");
          console.log("Parsed data:", jsonData);

          console.log("Parsed Excel data:", JSON.stringify(jsonData, null, 2));
          console.log("Number of records found:", jsonData.length);
          
          // Set progress to 50% after parsing
          setUploadProgress(50);
          
          // Transform data if needed to match expected format
          const transformedData = jsonData.map(item => {
            // Check if we need to transform the data (e.g., if column names don't match expected format)
            const keys = Object.keys(item);
            console.log("Original keys in Excel row:", keys);
            
            // Create a standardized object with expected column names
            const standardizedItem = {
              'Room Name': item['Room Name'] || item['room name'] || item['ROOM NAME'] || '',
              'Property ID': item['Property ID'] || item['property id'] || item['PROPERTY ID'] || '',
              'Property Name': item['Property Name'] || item['property name'] || item['PROPERTY NAME'] || '',
              'Room Type': item['Room Type'] || item['room type'] || item['ROOM TYPE'] || 'Single',
              'Status': item['Status'] || item['status'] || item['STATUS'] || 'Available',
              'Area (sq ft)': item['Area (sq ft)'] || item['area'] || item['AREA'] || 0,
              'Current Occupants': item['Current Occupants'] || item['current occupants'] || item['CURRENT OCCUPANTS'] || 0,
              'Max Occupants': item['Max Occupants'] || item['max occupants'] || item['MAX OCCUPANTS'] || 1,
              'Price': item['Price'] || item['price'] || item['PRICE'] || 0,
              'Date Available': item['Date Available'] || item['date available'] || item['DATE AVAILABLE'] || new Date().toISOString().split('T')[0]
            };
            
            // Format date properly if it's a number (Excel date serial)
            if (typeof standardizedItem['Date Available'] === 'number') {
              try {
                // Excel dates are stored as days since 1/1/1900
                // Convert Excel serial date to JS date
                const excelDate = standardizedItem['Date Available'] as number;
                const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                standardizedItem['Date Available'] = jsDate.toISOString().split('T')[0];
                console.log(`Converted Excel date ${excelDate} to ${standardizedItem['Date Available']}`);
              } catch (error) {
                console.error("Error converting Excel date format:", error);
                // Keep the original value if conversion fails
              }
            }
            
            console.log("Transformed item:", standardizedItem);
            return standardizedItem;
          });
          
          console.log("Full transformed data being sent to API:", transformedData);
          
          // Import room data
          console.log("%c CALLING BULK IMPORT API ", "background: #0000ff; color: white; font-size: 20px;");
          
          try {
            // Log the exact data being sent to the API
            console.log("Sending data to bulkImportRooms API:", JSON.stringify(transformedData.slice(0, 2), null, 2) + 
              (transformedData.length > 2 ? "... and " + (transformedData.length - 2) + " more items" : ""));
            
            // Call the API with a timeout to ensure we don't hang indefinitely
            const apiPromise = bulkImportRooms(transformedData);
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("API call timed out after 30 seconds")), 30000);
            });
            
            const result = await Promise.race([apiPromise, timeoutPromise]) as { success: any[], errors: string[] };
            
            console.log("%c API RESPONSE RECEIVED ", "background: #9900ff; color: white; font-size: 20px;");
            console.log("API response:", result);
            
            // Check if the result is valid
            if (!result || typeof result !== 'object') {
              throw new Error("Invalid response from API");
            }
            
            // Show results
            setUploadResults({
              success: result.success.length,
              errors: result.errors
            });
            
            if (result.success.length > 0) {
              toast.success(`Successfully processed ${result.success.length} rooms`);
            }
            
            if (result.errors.length > 0) {
              toast.error(`Failed to process ${result.errors.length} rooms`);
              console.error("Room import errors:", result.errors);
              setUploadStatus("error");
            } else {
              setUploadStatus("success");
            }
            
            setUploadProgress(100);
          } catch (apiError) {
            console.error("Error calling API:", apiError);
            toast.error("Failed to process rooms: " + (apiError as Error).message);
            setUploadStatus("error");
            setUploadProgress(0);
          }
        } catch (error) {
          console.error("Error processing file:", error);
          toast.error("Failed to process the Excel file. Please check the format.");
          setUploadStatus("error");
        } finally {
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        console.error("Error reading file");
        toast.error("Failed to read the Excel file");
        setUploadStatus("error");
        setUploading(false);
      };
      
      // Start reading the file - using ArrayBuffer instead of BinaryString for better compatibility
      console.log("%c STARTING FILE READ AS ARRAY BUFFER ", "background: #ff6600; color: white; font-size: 20px;");
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error("Error in upload process:", error);
      toast.error("An unexpected error occurred during upload");
      setUploadStatus("error");
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template with example data
    const headers = expectedColumns.join(',');
    const exampleData = [
      'Room 101,PROP001,Main Building,Single,Available,250,0,2,500,2025-09-01',
      'Room 102,PROP001,Main Building,Double,Occupied,350,2,2,750,2025-10-15'
    ].join('\n');
    
    const csvContent = headers + '\n' + exampleData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "rooms_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Room template downloaded successfully");
    
    // Log the expected format for debugging
    console.log("===== EXPECTED EXCEL FORMAT =====");
    console.log("Headers:", expectedColumns);
    console.log("Example data row 1:", 'Room 101,PROP001,Main Building,Single,Available,250,0,2,500,2025-09-01'.split(','));
    console.log("Example data row 2:", 'Room 102,PROP001,Main Building,Double,Occupied,350,2,2,750,2025-10-15'.split(','));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Upload Room Data</h2>
        <Badge variant="secondary">Properties</Badge>
      </div>
      <p className="text-muted-foreground mb-4">Upload Excel files to update room and property data</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
            <CardDescription>Select an Excel file (.xlsx, .xls) containing room data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Choose File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
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
                <AlertDescription>
                  File uploaded successfully! {uploadResults.success} rooms have been updated.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload failed. {uploadResults.errors.length > 0 ? 
                    `${uploadResults.errors.length} errors occurred.` : 
                    "Please check your file format and try again."}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading} 
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions Section */}
        <Card>
          <CardHeader>
            <CardTitle>File Format Requirements</CardTitle>
            <CardDescription>Follow these guidelines for successful uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {guidelines.map((guideline, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Room Template
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Error Details Section (shows only when there are errors) */}
      {uploadStatus === "error" && uploadResults.errors.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Upload Errors</CardTitle>
            <CardDescription>The following errors occurred during the upload process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto">
              <ul className="space-y-2">
                {uploadResults.errors.map((error, index) => (
                  <li key={index} className="text-sm border-l-2 border-destructive pl-3 py-1">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Debug Information Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Debug Information
          </CardTitle>
          <CardDescription>Troubleshooting information for room uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <details className="text-sm">
            <summary className="font-medium cursor-pointer text-blue-600 hover:text-blue-800">
              Expected Data Format (click to expand)
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
              <p className="mb-1"><strong>Required Columns:</strong></p>
              <ul className="list-disc pl-5 mb-3">
                <li><strong>Room Name</strong> - Unique identifier for the room (required)</li>
                <li><strong>Property ID</strong> - UUID of the property (will be auto-generated if missing or not in UUID format)</li>
              </ul>
              <p className="mb-1"><strong>Optional Columns:</strong></p>
              <ul className="list-disc pl-5">
                <li><strong>Property Name</strong> - Name of the property</li>
                <li><strong>Room Type</strong> - Single, Double, Suite, etc.</li>
                <li><strong>Status</strong> - Available, Occupied, Maintenance, Reserved</li>
                <li><strong>Area (sq ft)</strong> - Numeric value</li>
                <li><strong>Current Occupants</strong> - Number of current occupants</li>
                <li><strong>Max Occupants</strong> - Maximum allowed occupants</li>
                <li><strong>Price</strong> - Numeric value</li>
                <li><strong>Date Available</strong> - YYYY-MM-DD format</li>
              </ul>
            </div>
          </details>
          
          <details className="text-sm mt-3">
            <summary className="font-medium cursor-pointer text-blue-600 hover:text-blue-800">
              Troubleshooting Tips
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
              <p className="mb-1"><strong>Common Issues:</strong></p>
              <ul className="list-disc pl-5">
                <li>Excel column names must match expected format (case-insensitive matching is supported)</li>
                <li>Room Name is required for all rooms</li>
                <li>Property ID must be in UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)</li>
                <li>Property IDs will be auto-generated if missing or not in UUID format</li>
                <li>Date format can be YYYY-MM-DD, MM/DD/YYYY, or Excel date serial number</li>
                <li>Numeric fields should contain only numbers</li>
                <li>If rooms don't appear after upload, check browser console (F12) for detailed logs</li>
                <li>Try refreshing the page after upload to see newly added rooms</li>
                <li>Each room's name must be unique within a property</li>
              </ul>
              <p className="mt-2 text-gray-500">For developers: Detailed logs are available in the browser console (F12)</p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadRooms;
