import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FrontendExternalStaff } from '@/integration/supabase/types/external-staff';
import { ScrollArea } from '@/components/ui/scroll-area';
import { normalizeGender, getGenderOptions } from '@/utils/gender-normalizer';

interface ExternalStaffSlideFormProps {
  staff?: FrontendExternalStaff;
  onSubmit: (data: Partial<FrontendExternalStaff>) => Promise<void>;
  onClose: () => void;
  open: boolean;
  loading?: boolean;
}

export function ExternalStaffSlideForm({ staff, onSubmit, onClose, open, loading = false }: ExternalStaffSlideFormProps) {
  const [formData, setFormData] = useState<Partial<FrontendExternalStaff>>({});
  
  // Update form data when staff prop changes or when form opens
  useEffect(() => {
    if (staff) {
      setFormData({
        "PAYROLL FIRST NAME": staff["PAYROLL FIRST NAME"] || '',
        "PAYROLL LAST NAME": staff["PAYROLL LAST NAME"] || '',
        "PAYROLL MIDDLE NAME": staff["PAYROLL MIDDLE NAME"] || '',
        "GENDER (SELF-ID)": staff["GENDER (SELF-ID)"] || '',
        "BIRTH DATE": staff["BIRTH DATE"] || '',
        "PRIMARY ADDRESS LINE 1": staff["PRIMARY ADDRESS LINE 1"] || '',
        "PRIMARY ADDRESS LINE 2": staff["PRIMARY ADDRESS LINE 2"] || '',
        "PRIMARY ADDRESS LINE 3": staff["PRIMARY ADDRESS LINE 3"] || '',
        "GENERATION SUFFIX": staff["GENERATION SUFFIX"] || '',
        "LIVED-IN STATE": staff["LIVED-IN STATE"] || '',
        "WORKED IN STATE": staff["WORKED IN STATE"] || '',
        "PERSONAL E-MAIL": staff["PERSONAL E-MAIL"] || '',
        "WORK E-MAIL": staff["WORK E-MAIL"] || '',
        "HOME PHONE": staff["HOME PHONE"] || '',
        "WORK PHONE": staff["WORK PHONE"] || '',
        "POSITION ID": staff["POSITION ID"] || '',
        "ASSOCIATE ID": staff["ASSOCIATE ID"] || '',
        "FILE NUMBER": staff["FILE NUMBER"] || '',
        "COMPANY CODE": staff["COMPANY CODE"] || '',
        "JOB TITLE": staff["JOB TITLE"] || '',
        "BUSINESS UNIT": staff["BUSINESS UNIT"] || '',
        "HOME DEPARTMENT": staff["HOME DEPARTMENT"] || '',
        "LOCATION": staff["LOCATION"] || '',
        "WORKER CATEGORY": staff["WORKER CATEGORY"] || '',
        "POSITION STATUS": staff["POSITION STATUS"] || '',
        "HIRE DATE": staff["HIRE DATE"] || '',
        "REHIRE DATE": staff["REHIRE DATE"] || '',
        "TERMINATION DATE": staff["TERMINATION DATE"] || '',
        "YEARS OF SERVICE": staff["YEARS OF SERVICE"] || '',
        "REPORTS TO NAME": staff["REPORTS TO NAME"] || '',
        "JOB CLASS": staff["JOB CLASS"] || '',
      });
    } else {
      // Reset form data when creating a new staff member
      setFormData({
        "PAYROLL FIRST NAME": '',
        "PAYROLL LAST NAME": '',
        "PAYROLL MIDDLE NAME": '',
        "GENDER (SELF-ID)": '',
        "BIRTH DATE": '',
        "PRIMARY ADDRESS LINE 1": '',
        "PRIMARY ADDRESS LINE 2": '',
        "PRIMARY ADDRESS LINE 3": '',
        "GENERATION SUFFIX": '',
        "LIVED-IN STATE": '',
        "WORKED IN STATE": '',
        "PERSONAL E-MAIL": '',
        "WORK E-MAIL": '',
        "HOME PHONE": '',
        "WORK PHONE": '',
        "POSITION ID": '',
        "ASSOCIATE ID": '',
        "FILE NUMBER": '',
        "COMPANY CODE": '',
        "JOB TITLE": '',
        "BUSINESS UNIT": '',
        "HOME DEPARTMENT": '',
        "LOCATION": '',
        "WORKER CATEGORY": '',
        "POSITION STATUS": '',
        "HIRE DATE": '',
        "REHIRE DATE": '',
        "TERMINATION DATE": '',
        "YEARS OF SERVICE": '',
        "REPORTS TO NAME": '',
        "JOB CLASS": '',
      });
    }
  }, [staff, open]); // Re-run effect when staff or open state changes

  const handleInputChange = (field: keyof FrontendExternalStaff, value: string) => {
    let processedValue = value;
    
    // Normalize gender fields
    if (field === "GENDER (SELF-ID)") {
      processedValue = normalizeGender(value) || value;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{staff ? 'Edit Staff Information' : 'Add Staff Information'}</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="work">Work</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="firstname">First Name *</Label>
                    <Input
                      id="firstname"
                      value={formData["PAYROLL FIRST NAME"] || ''}
                      onChange={(e) => handleInputChange("PAYROLL FIRST NAME", e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastname">Last Name *</Label>
                    <Input
                      id="lastname"
                      value={formData["PAYROLL LAST NAME"] || ''}
                      onChange={(e) => handleInputChange("PAYROLL LAST NAME", e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstname2">Middle Name</Label>
                    <Input
                      id="firstname2"
                      value={formData["PAYROLL MIDDLE NAME"] || ''}
                      onChange={(e) => handleInputChange("PAYROLL MIDDLE NAME", e.target.value)}
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="legalfn">Generation Suffix</Label>
                    <Input
                      id="legalfn"
                      value={formData["GENERATION SUFFIX"] || ''}
                      onChange={(e) => handleInputChange("GENERATION SUFFIX", e.target.value)}
                      placeholder="Enter generation suffix (Jr., Sr., etc.)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData["GENDER (SELF-ID)"] || ''} onValueChange={(value) => handleInputChange("GENDER (SELF-ID)", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {getGenderOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender2">Lived-In State</Label>
                    <Input
                      id="gender2"
                      value={formData["LIVED-IN STATE"] || ''}
                      onChange={(e) => handleInputChange("LIVED-IN STATE", e.target.value)}
                      placeholder="Enter lived-in state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth">Birth Date</Label>
                    <Input
                      id="birth"
                      type="date"
                      value={formData["BIRTH DATE"] || ''}
                      onChange={(e) => handleInputChange("BIRTH DATE", e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="phoneno">File Number</Label>
                    <Input
                      id="phoneno"
                      value={formData["FILE NUMBER"] || ''}
                      onChange={(e) => handleInputChange("FILE NUMBER", e.target.value)}
                      placeholder="Enter file number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Worked In State</Label>
                    <Input
                      id="mobile"
                      value={formData["WORKED IN STATE"] || ''}
                      onChange={(e) => handleInputChange("WORKED IN STATE", e.target.value)}
                      placeholder="Enter worked in state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="home">Home Phone</Label>
                    <Input
                      id="home"
                      value={formData["HOME PHONE"] || ''}
                      onChange={(e) => handleInputChange("HOME PHONE", e.target.value)}
                      placeholder="Enter home phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="work">Work Phone</Label>
                    <Input
                      id="work"
                      value={formData["WORK PHONE"] || ''}
                      onChange={(e) => handleInputChange("WORK PHONE", e.target.value)}
                      placeholder="Enter work phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="personal">Personal Email</Label>
                    <Input
                      id="personal"
                      value={formData["PERSONAL E-MAIL"] || ''}
                      onChange={(e) => handleInputChange("PERSONAL E-MAIL", e.target.value)}
                      placeholder="Enter personal email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fax">Work Email</Label>
                    <Input
                      id="fax"
                      value={formData["WORK E-MAIL"] || ''}
                      onChange={(e) => handleInputChange("WORK E-MAIL", e.target.value)}
                      placeholder="Enter work email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="home2">Primary Address Line 1</Label>
                    <Input
                      id="home2"
                      value={formData["PRIMARY ADDRESS LINE 1"] || ''}
                      onChange={(e) => handleInputChange("PRIMARY ADDRESS LINE 1", e.target.value)}
                      placeholder="Enter primary address line 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business">Primary Address Line 2</Label>
                    <Input
                      id="business"
                      value={formData["PRIMARY ADDRESS LINE 2"] || ''}
                      onChange={(e) => handleInputChange("PRIMARY ADDRESS LINE 2", e.target.value)}
                      placeholder="Enter primary address line 2"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="jobtitle">Job Title</Label>
                    <Input
                      id="jobtitle"
                      value={formData["JOB TITLE"] || ''}
                      onChange={(e) => handleInputChange("JOB TITLE", e.target.value)}
                      placeholder="Enter job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobtitle2">Worker Category</Label>
                    <Input
                      id="jobtitle2"
                      value={formData["WORKER CATEGORY"] || ''}
                      onChange={(e) => handleInputChange("WORKER CATEGORY", e.target.value)}
                      placeholder="Enter worker category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company Code</Label>
                    <Input
                      id="company"
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
                    <Label htmlFor="position">Position ID</Label>
                    <Input
                      id="position"
                      value={formData["POSITION ID"] || ''}
                      onChange={(e) => handleInputChange("POSITION ID", e.target.value)}
                      placeholder="Enter position ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position2">Position Status</Label>
                    <Input
                      id="position2"
                      value={formData["POSITION STATUS"] || ''}
                      onChange={(e) => handleInputChange("POSITION STATUS", e.target.value)}
                      placeholder="Enter position status"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hiredate">Hire Date</Label>
                    <Input
                      id="hiredate"
                      type="date"
                      value={formData["HIRE DATE"] || ''}
                      onChange={(e) => handleInputChange("HIRE DATE", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="termdate">Termination Date</Label>
                    <Input
                      id="termdate"
                      type="date"
                      value={formData["TERMINATION DATE"] || ''}
                      onChange={(e) => handleInputChange("TERMINATION DATE", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rehire">Rehire Date</Label>
                    <Input
                      id="rehire"
                      type="date"
                      value={formData["REHIRE DATE"] || ''}
                      onChange={(e) => handleInputChange("REHIRE DATE", e.target.value)}
                      placeholder="Enter rehire date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobclass">Job Class</Label>
                    <Input
                      id="jobclass"
                      value={formData["JOB CLASS"] || ''}
                      onChange={(e) => handleInputChange("JOB CLASS", e.target.value)}
                      placeholder="Enter job class"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="primary">Primary Address Line 3</Label>
                    <Input
                      id="primary"
                      value={formData["PRIMARY ADDRESS LINE 3"] || ''}
                      onChange={(e) => handleInputChange("PRIMARY ADDRESS LINE 3", e.target.value)}
                      placeholder="Enter primary address line 3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary2">Home Department</Label>
                    <Input
                      id="primary2"
                      value={formData["HOME DEPARTMENT"] || ''}
                      onChange={(e) => handleInputChange("HOME DEPARTMENT", e.target.value)}
                      placeholder="Enter home department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainer">Business Unit</Label>
                    <Input
                      id="trainer"
                      value={formData["BUSINESS UNIT"] || ''}
                      onChange={(e) => handleInputChange("BUSINESS UNIT", e.target.value)}
                      placeholder="Enter business unit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainer2">Reports To Name</Label>
                    <Input
                      id="trainer2"
                      value={formData["REPORTS TO NAME"] || ''}
                      onChange={(e) => handleInputChange("REPORTS TO NAME", e.target.value)}
                      placeholder="Enter reports to name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="associate">Associate ID</Label>
                    <Input
                      id="associate"
                      value={formData["ASSOCIATE ID"] || ''}
                      onChange={(e) => handleInputChange("ASSOCIATE ID", e.target.value)}
                      placeholder="Enter associate ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsto">Years of Service</Label>
                    <Input
                      id="yearsto"
                      value={formData["YEARS OF SERVICE"] || ''}
                      onChange={(e) => handleInputChange("YEARS OF SERVICE", e.target.value)}
                      placeholder="Enter years of service"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reports">Reports To Name</Label>
                    <Textarea
                      id="reports"
                      value={formData["REPORTS TO NAME"] || ''}
                      onChange={(e) => handleInputChange("REPORTS TO NAME", e.target.value)}
                      placeholder="Enter reports to name"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t sticky bottom-0 bg-background">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : staff ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
