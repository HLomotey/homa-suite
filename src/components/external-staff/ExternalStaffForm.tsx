import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FrontendExternalStaff } from '@/integration/supabase/types/external-staff';
import { X } from 'lucide-react';

interface ExternalStaffFormProps {
  staff?: FrontendExternalStaff;
  onSubmit: (data: Partial<FrontendExternalStaff>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ExternalStaffForm({ staff, onSubmit, onCancel, loading = false }: ExternalStaffFormProps) {
  const [formData, setFormData] = useState<Partial<FrontendExternalStaff>>({
    "PAYROLL FIRST NAME": staff?.["PAYROLL FIRST NAME"] || '',
    "PAYROLL LAST NAME": staff?.["PAYROLL LAST NAME"] || '',
    "PAYROLL MIDDLE NAME": staff?.["PAYROLL MIDDLE NAME"] || '',
    "GENDER (SELF-ID)": staff?.["GENDER (SELF-ID)"] || '',
    "GENERATION SUFFIX": staff?.["GENERATION SUFFIX"] || '',
    "BIRTH DATE": staff?.["BIRTH DATE"] || '',
    "PRIMARY ADDRESS LINE 1": staff?.["PRIMARY ADDRESS LINE 1"] || '',
    "PRIMARY ADDRESS LINE 2": staff?.["PRIMARY ADDRESS LINE 2"] || '',
    "PRIMARY ADDRESS LINE 3": staff?.["PRIMARY ADDRESS LINE 3"] || '',
    "LIVED-IN STATE": staff?.["LIVED-IN STATE"] || '',
    "WORKED IN STATE": staff?.["WORKED IN STATE"] || '',
    "PERSONAL E-MAIL": staff?.["PERSONAL E-MAIL"] || '',
    "WORK E-MAIL": staff?.["WORK E-MAIL"] || '',
    "HOME PHONE": staff?.["HOME PHONE"] || '',
    "WORK PHONE": staff?.["WORK PHONE"] || '',
    "POSITION ID": staff?.["POSITION ID"] || '',
    "ASSOCIATE ID": staff?.["ASSOCIATE ID"] || '',
    "FILE NUMBER": staff?.["FILE NUMBER"] || '',
    "COMPANY CODE": staff?.["COMPANY CODE"] || '',
    "JOB TITLE": staff?.["JOB TITLE"] || '',
    "BUSINESS UNIT": staff?.["BUSINESS UNIT"] || '',
    "HOME DEPARTMENT": staff?.["HOME DEPARTMENT"] || '',
    "LOCATION": staff?.["LOCATION"] || '',
    "WORKER CATEGORY": staff?.["WORKER CATEGORY"] || '',
    "POSITION STATUS": staff?.["POSITION STATUS"] || '',
    "HIRE DATE": staff?.["HIRE DATE"] || '',
    "REHIRE DATE": staff?.["REHIRE DATE"] || '',
    "TERMINATION DATE": staff?.["TERMINATION DATE"] || '',
    "YEARS OF SERVICE": staff?.["YEARS OF SERVICE"] || '',
    "REPORTS TO NAME": staff?.["REPORTS TO NAME"] || '',
    "JOB CLASS": staff?.["JOB CLASS"] || '',
  });

  const handleInputChange = (field: keyof FrontendExternalStaff, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{staff ? 'Edit External Staff' : 'Add External Staff'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
                <TabsTrigger value="work">Work Info</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payroll-first-name">First Name *</Label>
                    <Input
                      id="payroll-first-name"
                      value={formData["PAYROLL FIRST NAME"] || ''}
                      onChange={(e) => handleInputChange("PAYROLL FIRST NAME", e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payroll-last-name">Last Name *</Label>
                    <Input
                      id="payroll-last-name"
                      value={formData["PAYROLL LAST NAME"] || ''}
                      onChange={(e) => handleInputChange("PAYROLL LAST NAME", e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payroll-middle-name">Middle Name</Label>
                    <Input
                      id="payroll-middle-name"
                      value={formData["PAYROLL MIDDLE NAME"] || ''}
                      onChange={(e) => handleInputChange("PAYROLL MIDDLE NAME", e.target.value)}
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="generation-suffix">Generation Suffix</Label>
                    <Input
                      id="generation-suffix"
                      value={formData["GENERATION SUFFIX"] || ''}
                      onChange={(e) => handleInputChange("GENERATION SUFFIX", e.target.value)}
                      placeholder="Enter generation suffix (Jr., Sr., etc.)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={formData["GENDER (SELF-ID)"] || ''} 
                      onValueChange={(value) => handleInputChange("GENDER (SELF-ID)", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="birth-date">Birth Date</Label>
                    <Input
                      id="birth-date"
                      type="date"
                      value={formData["BIRTH DATE"] || ''}
                      onChange={(e) => handleInputChange("BIRTH DATE", e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="personal-email">Personal Email</Label>
                    <Input
                      id="personal-email"
                      value={formData["PERSONAL E-MAIL"] || ''}
                      onChange={(e) => handleInputChange("PERSONAL E-MAIL", e.target.value)}
                      placeholder="Enter personal email"
                      type="email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-email">Work Email</Label>
                    <Input
                      id="work-email"
                      value={formData["WORK E-MAIL"] || ''}
                      onChange={(e) => handleInputChange("WORK E-MAIL", e.target.value)}
                      placeholder="Enter work email"
                      type="email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="home-phone">Home Phone</Label>
                    <Input
                      id="home-phone"
                      value={formData["HOME PHONE"] || ''}
                      onChange={(e) => handleInputChange("HOME PHONE", e.target.value)}
                      placeholder="Enter home phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-phone">Work Phone</Label>
                    <Input
                      id="work-phone"
                      value={formData["WORK PHONE"] || ''}
                      onChange={(e) => handleInputChange("WORK PHONE", e.target.value)}
                      placeholder="Enter work phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-address-1">Address Line 1</Label>
                    <Input
                      id="primary-address-1"
                      value={formData["PRIMARY ADDRESS LINE 1"] || ''}
                      onChange={(e) => handleInputChange("PRIMARY ADDRESS LINE 1", e.target.value)}
                      placeholder="Enter address line 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-address-2">Address Line 2</Label>
                    <Input
                      id="primary-address-2"
                      value={formData["PRIMARY ADDRESS LINE 2"] || ''}
                      onChange={(e) => handleInputChange("PRIMARY ADDRESS LINE 2", e.target.value)}
                      placeholder="Enter address line 2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-address-3">Address Line 3</Label>
                    <Input
                      id="primary-address-3"
                      value={formData["PRIMARY ADDRESS LINE 3"] || ''}
                      onChange={(e) => handleInputChange("PRIMARY ADDRESS LINE 3", e.target.value)}
                      placeholder="Enter address line 3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lived-in-state">Lived-In State</Label>
                    <Input
                      id="lived-in-state"
                      value={formData["LIVED-IN STATE"] || ''}
                      onChange={(e) => handleInputChange("LIVED-IN STATE", e.target.value)}
                      placeholder="Enter state of residence"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input
                      id="job-title"
                      value={formData["JOB TITLE"] || ''}
                      onChange={(e) => handleInputChange("JOB TITLE", e.target.value)}
                      placeholder="Enter job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position-id">Position ID</Label>
                    <Input
                      id="position-id"
                      value={formData["POSITION ID"] || ''}
                      onChange={(e) => handleInputChange("POSITION ID", e.target.value)}
                      placeholder="Enter position ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-code">Company Code</Label>
                    <Input
                      id="company-code"
                      value={formData["COMPANY CODE"] || ''}
                      onChange={(e) => handleInputChange("COMPANY CODE", e.target.value)}
                      placeholder="Enter company code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData["LOCATION"] || ''}
                      onChange={(e) => handleInputChange("LOCATION", e.target.value)}
                      placeholder="Enter work location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position-status">Position Status</Label>
                    <Input
                      id="position-status"
                      value={formData["POSITION STATUS"] || ''}
                      onChange={(e) => handleInputChange("POSITION STATUS", e.target.value)}
                      placeholder="Enter position status"
                    />
                  </div>
                  <div>
                    <Label htmlFor="worker-category">Worker Category</Label>
                    <Input
                      id="worker-category"
                      value={formData["WORKER CATEGORY"] || ''}
                      onChange={(e) => handleInputChange("WORKER CATEGORY", e.target.value)}
                      placeholder="Enter worker category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hire-date">Hire Date</Label>
                    <Input
                      id="hire-date"
                      type="date"
                      value={formData["HIRE DATE"] || ''}
                      onChange={(e) => handleInputChange("HIRE DATE", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="termination-date">Termination Date</Label>
                    <Input
                      id="termination-date"
                      type="date"
                      value={formData["TERMINATION DATE"] || ''}
                      onChange={(e) => handleInputChange("TERMINATION DATE", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rehire-date">Rehire Date</Label>
                    <Input
                      id="rehire-date"
                      type="date"
                      value={formData["REHIRE DATE"] || ''}
                      onChange={(e) => handleInputChange("REHIRE DATE", e.target.value)}
                      placeholder="Enter rehire date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="job-class">Job Class</Label>
                    <Input
                      id="job-class"
                      value={formData["JOB CLASS"] || ''}
                      onChange={(e) => handleInputChange("JOB CLASS", e.target.value)}
                      placeholder="Enter job class"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="associate-id">Associate ID</Label>
                    <Input
                      id="associate-id"
                      value={formData["ASSOCIATE ID"] || ''}
                      onChange={(e) => handleInputChange("ASSOCIATE ID", e.target.value)}
                      placeholder="Enter associate ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="file-number">File Number</Label>
                    <Input
                      id="file-number"
                      value={formData["FILE NUMBER"] || ''}
                      onChange={(e) => handleInputChange("FILE NUMBER", e.target.value)}
                      placeholder="Enter file number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-unit">Business Unit</Label>
                    <Input
                      id="business-unit"
                      value={formData["BUSINESS UNIT"] || ''}
                      onChange={(e) => handleInputChange("BUSINESS UNIT", e.target.value)}
                      placeholder="Enter business unit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="home-department">Home Department</Label>
                    <Input
                      id="home-department"
                      value={formData["HOME DEPARTMENT"] || ''}
                      onChange={(e) => handleInputChange("HOME DEPARTMENT", e.target.value)}
                      placeholder="Enter home department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="worked-in-state">Worked In State</Label>
                    <Input
                      id="worked-in-state"
                      value={formData["WORKED IN STATE"] || ''}
                      onChange={(e) => handleInputChange("WORKED IN STATE", e.target.value)}
                      placeholder="Enter worked in state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="years-of-service">Years of Service</Label>
                    <Input
                      id="years-of-service"
                      value={formData["YEARS OF SERVICE"] || ''}
                      onChange={(e) => handleInputChange("YEARS OF SERVICE", e.target.value)}
                      placeholder="Enter years of service"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="reports-to-name">Reports To Name</Label>
                    <Textarea
                      id="reports-to-name"
                      value={formData["REPORTS TO NAME"] || ''}
                      onChange={(e) => handleInputChange("REPORTS TO NAME", e.target.value)}
                      placeholder="Enter reports to name"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : staff ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
