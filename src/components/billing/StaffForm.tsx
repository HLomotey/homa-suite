import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FrontendBillingStaff } from "../../integration/supabase/types/billing";
import { Loader2 } from "lucide-react";

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: Omit<FrontendBillingStaff, "id"> | { id: string } & Partial<Omit<FrontendBillingStaff, "id">>) => void;
  isLoading?: boolean;
  staff?: FrontendBillingStaff; // For editing existing staff
}

export function StaffForm({ open, onOpenChange, onSubmit, isLoading = false, staff }: StaffFormProps) {
  const isEditing = !!staff;
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    
    if (isEditing && staff) {
      // For editing, include ID and only changed fields
      const data: { id: string } & Partial<Omit<FrontendBillingStaff, "id">> = {
        id: staff.id,
        // Personal Information
        legalName: formData.get('legalName') as string,
        preferredName: formData.get('preferredName') as string || undefined,
        birthName: formData.get('birthName') as string || undefined,
        
        // Contact Information
        email: formData.get('email') as string,
        phoneNumber: formData.get('phoneNumber') as string || undefined,
        address: formData.get('address') as string || undefined,
        
        // Emergency Contacts
        emergencyContactName: formData.get('emergencyContactName') as string || undefined,
        emergencyContactPhone: formData.get('emergencyContactPhone') as string || undefined,
        emergencyContactRelationship: formData.get('emergencyContactRelationship') as string || undefined,
        
        // Personal Details
        maritalStatus: formData.get('maritalStatus') as string || undefined,
        
        // EEO Data
        gender: formData.get('gender') as string || undefined,
        ethnicityRace: formData.get('ethnicityRace') as string || undefined,
        veteranStatus: formData.get('veteranStatus') as string || undefined,
        disabilityStatus: formData.get('disabilityStatus') as string || undefined,
        
        // Work-Related Information
        employeeId: formData.get('employeeId') as string || undefined,
        jobTitle: formData.get('jobTitle') as string,
        department: formData.get('department') as string,
        location: formData.get('location') as string || undefined,
        employmentStatus: formData.get('employmentStatus') as string,
        hireDate: formData.get('hireDate') as string,
        terminationDate: formData.get('terminationDate') as string || undefined,
        
        // Compensation Information
        salary: formData.get('salary') ? Number(formData.get('salary')) : undefined,
        hourlyRate: formData.get('hourlyRate') ? Number(formData.get('hourlyRate')) : undefined,
      };
      
      onSubmit(data);
    } else {
      // For creating new staff
      const data: Omit<FrontendBillingStaff, "id"> = {
        // Personal Information
        legalName: formData.get('legalName') as string,
        preferredName: formData.get('preferredName') as string || undefined,
        birthName: formData.get('birthName') as string || undefined,
        
        // Contact Information
        email: formData.get('email') as string,
        phoneNumber: formData.get('phoneNumber') as string || undefined,
        address: formData.get('address') as string || undefined,
        
        // Emergency Contacts
        emergencyContactName: formData.get('emergencyContactName') as string || undefined,
        emergencyContactPhone: formData.get('emergencyContactPhone') as string || undefined,
        emergencyContactRelationship: formData.get('emergencyContactRelationship') as string || undefined,
        
        // Personal Details
        maritalStatus: formData.get('maritalStatus') as string || undefined,
        
        // EEO Data
        gender: formData.get('gender') as string || undefined,
        ethnicityRace: formData.get('ethnicityRace') as string || undefined,
        veteranStatus: formData.get('veteranStatus') as string || undefined,
        disabilityStatus: formData.get('disabilityStatus') as string || undefined,
        
        // Work-Related Information
        employeeId: formData.get('employeeId') as string || undefined,
        jobTitle: formData.get('jobTitle') as string,
        department: formData.get('department') as string,
        location: formData.get('location') as string || undefined,
        employmentStatus: formData.get('employmentStatus') as string,
        hireDate: formData.get('hireDate') as string,
        terminationDate: formData.get('terminationDate') as string || undefined,
        
        // Compensation Information
        salary: formData.get('salary') ? Number(formData.get('salary')) : undefined,
        hourlyRate: formData.get('hourlyRate') ? Number(formData.get('hourlyRate')) : undefined,
      };
      
      onSubmit(data);
    }
    
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Staff Member" : "New Staff Member"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Edit comprehensive staff member details." : "Add a new staff member with comprehensive information."}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="work">Work Info</TabsTrigger>
              <TabsTrigger value="eeo">EEO Data</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input 
                    type="text" 
                    id="legalName" 
                    name="legalName" 
                    placeholder="Full legal name" 
                    defaultValue={staff?.legalName || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input 
                    type="text" 
                    id="preferredName" 
                    name="preferredName" 
                    placeholder="Preferred name" 
                    defaultValue={staff?.preferredName || ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthName">Birth Name</Label>
                  <Input 
                    type="text" 
                    id="birthName" 
                    name="birthName" 
                    placeholder="Birth name (if different)" 
                    defaultValue={staff?.birthName || ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="email@example.com" 
                    defaultValue={staff?.email || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    type="tel" 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    placeholder="+1 (555) 123-4567" 
                    defaultValue={staff?.phoneNumber || ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    placeholder="Full address" 
                    defaultValue={staff?.address || ""}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select name="maritalStatus" defaultValue={staff?.maritalStatus || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Emergency Contact Section */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Emergency Contact</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input 
                      type="text" 
                      id="emergencyContactName" 
                      name="emergencyContactName" 
                      placeholder="Full name" 
                      defaultValue={staff?.emergencyContactName || ""}
                    />
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input 
                      type="tel" 
                      id="emergencyContactPhone" 
                      name="emergencyContactPhone" 
                      placeholder="+1 (555) 123-4567" 
                      defaultValue={staff?.emergencyContactPhone || ""}
                    />
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Select name="emergencyContactRelationship" defaultValue={staff?.emergencyContactRelationship || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Friend">Friend</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Work Information Tab */}
            <TabsContent value="work" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input 
                    type="text" 
                    id="employeeId" 
                    name="employeeId" 
                    placeholder="Employee ID/File Number" 
                    defaultValue={staff?.employeeId || ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input 
                    type="text" 
                    id="jobTitle" 
                    name="jobTitle" 
                    placeholder="Job title" 
                    defaultValue={staff?.jobTitle || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select name="department" defaultValue={staff?.department || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    type="text" 
                    id="location" 
                    name="location" 
                    placeholder="Work location" 
                    defaultValue={staff?.location || ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <Select name="employmentStatus" defaultValue={staff?.employmentStatus || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contractor">Contractor</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date *</Label>
                  <Input 
                    type="date" 
                    id="hireDate" 
                    name="hireDate" 
                    defaultValue={staff?.hireDate || ""}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="terminationDate">Termination Date</Label>
                  <Input 
                    type="date" 
                    id="terminationDate" 
                    name="terminationDate" 
                    defaultValue={staff?.terminationDate || ""}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* EEO Data Tab */}
            <TabsContent value="eeo" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Equal Employment Opportunity data is collected for compliance purposes and is optional.
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" defaultValue={staff?.gender || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ethnicityRace">Ethnicity/Race</Label>
                  <Select name="ethnicityRace" defaultValue={staff?.ethnicityRace || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity/race" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="American Indian or Alaska Native">American Indian or Alaska Native</SelectItem>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="Black or African American">Black or African American</SelectItem>
                      <SelectItem value="Hispanic or Latino">Hispanic or Latino</SelectItem>
                      <SelectItem value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Two or more races">Two or more races</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="veteranStatus">Veteran Status</Label>
                  <Select name="veteranStatus" defaultValue={staff?.veteranStatus || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select veteran status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not a veteran">Not a veteran</SelectItem>
                      <SelectItem value="Veteran">Veteran</SelectItem>
                      <SelectItem value="Disabled veteran">Disabled veteran</SelectItem>
                      <SelectItem value="Recently separated veteran">Recently separated veteran</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="disabilityStatus">Disability Status</Label>
                  <Select name="disabilityStatus" defaultValue={staff?.disabilityStatus || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disability status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No disability">No disability</SelectItem>
                      <SelectItem value="Has a disability">Has a disability</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            {/* Compensation Tab */}
            <TabsContent value="compensation" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Compensation information is confidential and used for payroll and benefits administration.
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary</Label>
                  <Input 
                    type="number" 
                    id="salary" 
                    name="salary" 
                    placeholder="Annual salary amount" 
                    defaultValue={staff?.salary || ""}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate</Label>
                  <Input 
                    type="number" 
                    id="hourlyRate" 
                    name="hourlyRate" 
                    placeholder="Hourly rate" 
                    defaultValue={staff?.hourlyRate || ""}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-4 border-t">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Staff Member" : "Create Staff Member"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
