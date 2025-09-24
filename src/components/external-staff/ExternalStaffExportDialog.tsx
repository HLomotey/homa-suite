import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, Database } from "lucide-react";
import { FrontendExternalStaff } from "@/integration/supabase/types/external-staff";
import { toast } from "sonner";

interface ExternalStaffExportDialogProps {
  open: boolean;
  onClose: () => void;
  allStaff: FrontendExternalStaff[];
  filteredStaff: FrontendExternalStaff[];
  selectedStaff: FrontendExternalStaff[];
  onExport: (data: FrontendExternalStaff[], format: string, fields: string[]) => void;
  currentStatus: string;
}

const AVAILABLE_FIELDS = [
  { key: 'ASSOCIATE ID', label: 'Associate ID', category: 'Basic Info' },
  { key: 'PAYROLL FIRST NAME', label: 'First Name', category: 'Basic Info' },
  { key: 'PAYROLL LAST NAME', label: 'Last Name', category: 'Basic Info' },
  { key: 'PAYROLL MIDDLE NAME', label: 'Middle Name', category: 'Basic Info' },
  { key: 'JOB TITLE', label: 'Job Title', category: 'Employment' },
  { key: 'COMPANY CODE', label: 'Company Code', category: 'Employment' },
  { key: 'BUSINESS UNIT', label: 'Business Unit', category: 'Employment' },
  { key: 'HOME DEPARTMENT', label: 'Department', category: 'Employment' },
  { key: 'LOCATION', label: 'Location', category: 'Employment' },
  { key: 'POSITION STATUS', label: 'Position Status', category: 'Employment' },
  { key: 'WORKER CATEGORY', label: 'Worker Category', category: 'Employment' },
  { key: 'JOB CLASS', label: 'Job Class', category: 'Employment' },
  { key: 'HIRE DATE', label: 'Hire Date', category: 'Employment' },
  { key: 'REHIRE DATE', label: 'Rehire Date', category: 'Employment' },
  { key: 'TERMINATION DATE', label: 'Termination Date', category: 'Employment' },
  { key: 'YEARS OF SERVICE', label: 'Years of Service', category: 'Employment' },
  { key: 'REPORTS TO NAME', label: 'Reports To', category: 'Employment' },
  { key: 'WORK E-MAIL', label: 'Work Email', category: 'Contact' },
  { key: 'PERSONAL E-MAIL', label: 'Personal Email', category: 'Contact' },
  { key: 'HOME PHONE', label: 'Home Phone', category: 'Contact' },
  { key: 'WORK PHONE', label: 'Work Phone', category: 'Contact' },
  { key: 'PRIMARY ADDRESS LINE 1', label: 'Address Line 1', category: 'Address' },
  { key: 'PRIMARY ADDRESS LINE 2', label: 'Address Line 2', category: 'Address' },
  { key: 'PRIMARY ADDRESS LINE 3', label: 'Address Line 3', category: 'Address' },
  { key: 'LIVED-IN STATE', label: 'State (Lived)', category: 'Address' },
  { key: 'WORKED IN STATE', label: 'State (Worked)', category: 'Address' },
  { key: 'POSITION ID', label: 'Position ID', category: 'System' },
  { key: 'FILE NUMBER', label: 'File Number', category: 'System' },
];

const DEFAULT_FIELDS = [
  'ASSOCIATE ID',
  'PAYROLL FIRST NAME',
  'PAYROLL LAST NAME',
  'JOB TITLE',
  'COMPANY CODE',
  'HOME DEPARTMENT',
  'LOCATION',
  'HIRE DATE',
  'TERMINATION DATE',
  'WORK E-MAIL',
];

export function ExternalStaffExportDialog({
  open,
  onClose,
  allStaff,
  filteredStaff,
  selectedStaff,
  onExport,
  currentStatus,
}: ExternalStaffExportDialogProps) {
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('filtered');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'json'>('excel');
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_FIELDS);
  const [fieldPreset, setFieldPreset] = useState<'default' | 'basic' | 'complete' | 'custom'>('default');

  const fieldsByCategory = AVAILABLE_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_FIELDS>);

  const getDataToExport = () => {
    switch (exportScope) {
      case 'all':
        return allStaff;
      case 'filtered':
        return filteredStaff;
      case 'selected':
        return selectedStaff;
      default:
        return filteredStaff;
    }
  };

  const handleFieldPresetChange = (preset: string) => {
    setFieldPreset(preset as any);
    
    switch (preset) {
      case 'basic':
        setSelectedFields([
          'ASSOCIATE ID',
          'PAYROLL FIRST NAME',
          'PAYROLL LAST NAME',
          'JOB TITLE',
          'LOCATION',
          'HIRE DATE',
        ]);
        break;
      case 'complete':
        setSelectedFields(AVAILABLE_FIELDS.map(f => f.key));
        break;
      case 'default':
        setSelectedFields(DEFAULT_FIELDS);
        break;
      case 'custom':
        // Keep current selection
        break;
    }
  };

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    setFieldPreset('custom');
    if (checked) {
      setSelectedFields(prev => [...prev, fieldKey]);
    } else {
      setSelectedFields(prev => prev.filter(f => f !== fieldKey));
    }
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setFieldPreset('custom');
    const categoryFields = fieldsByCategory[category].map(f => f.key);
    
    if (checked) {
      setSelectedFields(prev => [...new Set([...prev, ...categoryFields])]);
    } else {
      setSelectedFields(prev => prev.filter(f => !categoryFields.includes(f)));
    }
  };

  const handleExport = () => {
    const dataToExport = getDataToExport();
    
    if (dataToExport.length === 0) {
      toast.error("No data available to export");
      return;
    }

    if (selectedFields.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    onExport(dataToExport, exportFormat, selectedFields);
    onClose();
  };

  const getRecordCount = (scope: string) => {
    switch (scope) {
      case 'all':
        return allStaff.length;
      case 'filtered':
        return filteredStaff.length;
      case 'selected':
        return selectedStaff.length;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export External Staff Data
          </DialogTitle>
          <DialogDescription>
            Configure your export settings and select the fields you want to include.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={exportScope} onValueChange={(value: any) => setExportScope(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex-1">
                    All Records ({allStaff.length} records)
                    <div className="text-sm text-muted-foreground">
                      Export all staff records regardless of current filters
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filtered" id="filtered" />
                  <Label htmlFor="filtered" className="flex-1">
                    Current View ({filteredStaff.length} records)
                    <div className="text-sm text-muted-foreground">
                      Export only records matching current filters and search
                    </div>
                  </Label>
                </div>
                {selectedStaff.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="selected" />
                    <Label htmlFor="selected" className="flex-1">
                      Selected Records ({selectedStaff.length} records)
                      <div className="text-sm text-muted-foreground">
                        Export only the records you have selected
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.xlsx)
                    <span className="text-sm text-muted-foreground">- Recommended for analysis</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (.csv)
                    <span className="text-sm text-muted-foreground">- Universal compatibility</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    JSON (.json)
                    <span className="text-sm text-muted-foreground">- For developers</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Field Selection</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="preset">Quick Presets:</Label>
              <Select value={fieldPreset} onValueChange={handleFieldPresetChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Fields</SelectItem>
                  <SelectItem value="basic">Basic Info Only</SelectItem>
                  <SelectItem value="complete">All Fields</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                ({selectedFields.length} fields selected)
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(fieldsByCategory).map(([category, fields]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={fields.every(f => selectedFields.includes(f.key))}
                      onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                    />
                    <Label htmlFor={`category-${category}`} className="font-medium">
                      {category}
                    </Label>
                  </div>
                  <div className="ml-6 space-y-1">
                    {fields.map((field) => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={(checked) => handleFieldToggle(field.key, !!checked)}
                        />
                        <Label htmlFor={field.key} className="text-sm">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export {getRecordCount(exportScope)} Records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
