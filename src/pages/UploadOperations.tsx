"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function UploadOperations() {
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

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadStatus("success");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const expectedColumns = [
    "Task ID",
    "Property ID",
    "Task Type",
    "Priority",
    "Status",
    "Assigned To",
    "Created Date",
    "Due Date",
    "Completed Date",
    "Description",
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <ClipboardList className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold">Upload Operations Data</h1>
          <Badge variant="secondary">Operations</Badge>
        </div>
        <p className="text-muted-foreground">Upload Excel files to update operations tasks and maintenance records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
            <CardDescription>Select an Excel file (.xlsx, .xls) containing operations data</CardDescription>
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
                <FileSpreadsheet className="h-4 w-4 text-purple-600" />
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
                <AlertDescription>File uploaded successfully! Operations data has been updated.</AlertDescription>
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
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
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
                <li>• Priority: Low, Medium, High, Critical</li>
                <li>• Status: Open, In Progress, Completed, Cancelled</li>
                <li>• Task Type: Maintenance, Inspection, Cleaning, Repair, Other</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
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
          <CardDescription>History of recent operations data uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { file: "maintenance_tasks_june.xlsx", date: "2024-06-28", records: 156, status: "success" },
              { file: "property_inspections_q2.xlsx", date: "2024-06-20", records: 42, status: "success" },
              { file: "repair_requests_june.xlsx", date: "2024-06-10", records: 87, status: "error" },
            ].map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-purple-600" />
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
