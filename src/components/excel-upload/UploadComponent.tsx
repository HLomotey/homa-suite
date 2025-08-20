import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { ExcelFileProcessor } from "./ExcelFileProcessor";
import { BatchProcessor } from "./BatchProcessor";

interface UploadComponentProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  expectedColumns: string[];
  guidelines: string[];
  templateName: string;
  badgeText: string;
}

export const UploadComponent: React.FC<UploadComponentProps> = ({
  title,
  icon: Icon,
  description,
  expectedColumns,
  guidelines,
  templateName,
  badgeText,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Process Excel file
      const processedData = await ExcelFileProcessor.processFile(file);
      
      // Create batch processor with progress callbacks
      const batchProcessor = new BatchProcessor({
        batchSize: 100,
        onProgress: (processed, total) => {
          const progress = Math.min((processed / total) * 100, 100);
          setUploadProgress(progress);
        },
        onBatchComplete: (batchIndex, batchSize) => {
          console.log(`Completed batch ${batchIndex}: ${batchSize} rows`);
        }
      });

      // Process the data
      const processedCount = await batchProcessor.processFinanceData(processedData.data);

      setUploading(false);
      setUploadStatus("success");
      toast.success(`${title} file uploaded successfully! Processed ${processedCount} rows.`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadStatus("error");
      toast.error(`Failed to upload ${title} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = expectedColumns.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateName;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`${templateName} downloaded successfully`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Select an Excel file (.xlsx, .xls) containing {title.toLowerCase()} data
          </CardDescription>
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
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {uploadStatus === "success" && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File uploaded successfully! Data has been processed and saved to the database.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload failed. Please check the file format and try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
              {uploading ? "Processing..." : "Upload File"}
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            File Format Requirements
            <Badge variant="secondary">{badgeText}</Badge>
          </CardTitle>
          <CardDescription>
            Ensure your Excel file follows the correct format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Columns:</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              {expectedColumns.map((column, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  {column}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Guidelines:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {guidelines.map((guideline, index) => (
                <li key={index}>• {guideline}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
