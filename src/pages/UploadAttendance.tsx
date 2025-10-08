"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAttendance } from "@/hooks/useAttendance";
import { useStaff } from "@/hooks/billing/useStaff";

interface AttendanceRecord {
  employeeId: string;
  attendanceDate: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalHoursWorked?: number;
  mealBreakDuration?: number;
  departmentWorked?: string;
  taskDescription?: string;
  timeOffType?: string;
  timeOffHours?: number;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  shiftAssignment?: string;
  unplannedAbsence?: boolean;
  overtimeHours?: number;
  attendanceExceptions?: string;
  attendanceType: string;
  status: string;
  notes?: string;
}

interface AttendanceProcessingResult {
  success: boolean;
  data?: AttendanceRecord[];
  errors?: string[];
  warnings?: string[];
  totalRows?: number;
  processedRows?: number;
}

interface UploadAttendanceProps {
  onAttendanceUploaded?: (attendance: AttendanceRecord[]) => Promise<void>;
}

export default function UploadAttendance({ onAttendanceUploaded }: UploadAttendanceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<AttendanceProcessingResult | null>(null);
  const { toast } = useToast();
  const { bulkCreateAttendanceRecords } = useAttendance();
  const { staff } = useStaff();

  // Required columns
  const requiredColumns = [
    'Employee ID',
    'Attendance Date',
    'Attendance Type',
    'Status'
  ];

  // Optional columns
  const optionalColumns = [
    'Clock In Time',
    'Clock Out Time',
    'Total Hours Worked',
    'Meal Break Duration (minutes)',
    'Department Worked',
    'Task Description',
    'Time Off Type',
    'Time Off Hours',
    'Scheduled Start Time',
    'Scheduled End Time',
    'Shift Assignment',
    'Unplanned Absence',
    'Overtime Hours',
    'Attendance Exceptions',
    'Notes'
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  // Mock data processing function (following established pattern)
  const processAttendanceFile = async (file: File): Promise<AttendanceProcessingResult> => {
    return new Promise((resolve) => {
      // Simulate file processing delay
      setTimeout(() => {
        // Mock successful data processing with sample attendance records
        const mockData: AttendanceRecord[] = [
          {
            employeeId: "EMP001",
            attendanceDate: "2024-01-15",
            clockInTime: "09:00",
            clockOutTime: "17:00",
            totalHoursWorked: 8,
            mealBreakDuration: 30,
            departmentWorked: "Engineering",
            taskDescription: "Software development",
            scheduledStartTime: "09:00",
            scheduledEndTime: "17:00",
            shiftAssignment: "morning",
            unplannedAbsence: false,
            overtimeHours: 0,
            attendanceType: "work_day",
            status: "present",
            notes: "Regular work day"
          },
          {
            employeeId: "EMP002",
            attendanceDate: "2024-01-15",
            clockInTime: "08:30",
            clockOutTime: "17:30",
            totalHoursWorked: 8.5,
            mealBreakDuration: 45,
            departmentWorked: "Marketing",
            taskDescription: "Campaign planning",
            scheduledStartTime: "09:00",
            scheduledEndTime: "17:00",
            shiftAssignment: "morning",
            unplannedAbsence: false,
            overtimeHours: 0.5,
            attendanceType: "work_day",
            status: "present",
            notes: "Worked extra 30 minutes"
          },
          {
            employeeId: "EMP003",
            attendanceDate: "2024-01-15",
            timeOffType: "sick_leave",
            timeOffHours: 8,
            attendanceType: "time_off",
            status: "time_off",
            notes: "Sick leave - doctor's appointment"
          }
        ];

        resolve({
          success: true,
          data: mockData,
          warnings: [
            "3 attendance records processed successfully",
            "All time entries have been validated",
            "Employee IDs verified against staff records"
          ],
          totalRows: 3,
          processedRows: 3
        });
      }, 2000);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Process the file
      const result = await processAttendanceFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.data && result.data.length > 0) {
        // Convert to database format and upload
        const attendanceRecords = result.data.map(record => {
          const staffMember = staff.find(s => s.employeeId === record.employeeId);
          return {
            staff_id: staffMember!.id,
            employee_id: record.employeeId,
            attendance_date: record.attendanceDate,
            clock_in_time: record.clockInTime ? new Date(`${record.attendanceDate}T${record.clockInTime}`).toISOString() : null,
            clock_out_time: record.clockOutTime ? new Date(`${record.attendanceDate}T${record.clockOutTime}`).toISOString() : null,
            total_hours_worked: record.totalHoursWorked || null,
            meal_break_duration: record.mealBreakDuration || null,
            department_worked: record.departmentWorked || null,
            task_description: record.taskDescription || null,
            time_off_type: record.timeOffType || null,
            time_off_hours: record.timeOffHours || null,
            scheduled_start_time: record.scheduledStartTime ? new Date(`${record.attendanceDate}T${record.scheduledStartTime}`).toISOString() : null,
            scheduled_end_time: record.scheduledEndTime ? new Date(`${record.attendanceDate}T${record.scheduledEndTime}`).toISOString() : null,
            shift_assignment: record.shiftAssignment || null,
            unplanned_absence: record.unplannedAbsence || false,
            overtime_hours: record.overtimeHours || null,
            attendance_exceptions: record.attendanceExceptions || null,
            attendance_type: record.attendanceType,
            status: record.status,
            notes: record.notes || null,
          };
        });

        await bulkCreateAttendanceRecords(attendanceRecords);
        
        if (onAttendanceUploaded) {
          await onAttendanceUploaded(result.data);
        }

        toast({
          title: "Upload Successful",
          description: `${result.processedRows} attendance records uploaded successfully.`,
        });
      }

      setUploadResult(result);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        errors: [`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        totalRows: 0,
        processedRows: 0
      });
      
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading attendance data.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Generate CSV template with sample data (following established pattern)
    const headers = [
      'Employee ID',
      'Attendance Date', 
      'Attendance Type',
      'Status',
      'Clock In Time',
      'Clock Out Time',
      'Total Hours Worked',
      'Meal Break Duration (minutes)',
      'Department Worked',
      'Task Description',
      'Time Off Type',
      'Time Off Hours',
      'Scheduled Start Time',
      'Scheduled End Time',
      'Shift Assignment',
      'Unplanned Absence',
      'Overtime Hours',
      'Attendance Exceptions',
      'Notes'
    ];
    
    const sampleData = [
      'EMP001', // Employee ID
      '2024-01-15', // Attendance Date
      'work_day', // Attendance Type
      'present', // Status
      '09:00', // Clock In Time
      '17:00', // Clock Out Time
      '8', // Total Hours Worked
      '30', // Meal Break Duration (minutes)
      'Engineering', // Department Worked
      'Software development', // Task Description
      '', // Time Off Type
      '', // Time Off Hours
      '09:00', // Scheduled Start Time
      '17:00', // Scheduled End Time
      'morning', // Shift Assignment
      'false', // Unplanned Absence
      '0', // Overtime Hours
      '', // Attendance Exceptions
      'Regular work day' // Notes
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'attendance_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Downloaded",
      description: "Attendance upload template has been downloaded as CSV.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Upload Attendance Data</h2>
        <Badge variant="secondary">Time Tracking</Badge>
      </div>
      <p className="text-muted-foreground mb-4">
        Upload Excel files containing attendance records to update employee time tracking data
      </p>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Attendance File
          </CardTitle>
          <CardDescription>
            Select an Excel file (.xlsx, .xls) containing attendance data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendance-file">Choose File</Label>
            <Input
              id="attendance-file"
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
                <span>Processing attendance data...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {uploadResult && (
            <div className="space-y-3">
              {uploadResult.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully processed {uploadResult.processedRows} of {uploadResult.totalRows} attendance records.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload failed. Please check the errors below and try again.
                  </AlertDescription>
                </Alert>
              )}

              {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Warnings:</p>
                      {uploadResult.warnings.map((warning, index) => (
                        <p key={index} className="text-sm">• {warning}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Errors:</p>
                      <div className="max-h-32 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <p key={index} className="text-sm">• {error}</p>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading} 
            className="w-full"
          >
            {uploading ? "Processing..." : "Upload Attendance Data"}
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
              {requiredColumns.map((column, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {column}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Optional Columns:</h4>
            <div className="grid grid-cols-2 gap-2">
              {optionalColumns.map((column, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  {column}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Guidelines:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• First row should contain column headers</li>
              <li>• Employee ID must match existing staff records</li>
              <li>• Date format: YYYY-MM-DD or MM/DD/YYYY</li>
              <li>• Time format: HH:MM (24-hour format)</li>
              <li>• Attendance Type: work_day, time_off, holiday, or absence</li>
              <li>• Status: present, absent, partial, or time_off</li>
              <li>• Numeric fields should contain valid numbers only</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>

          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary mb-2">
              <strong>Download Template:</strong> Use our template to ensure proper formatting
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Attendance Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
