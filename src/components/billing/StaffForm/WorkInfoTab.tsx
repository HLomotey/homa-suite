import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrontendBillingStaff } from "@/integration/supabase/types/billing";
import { StaffLocationSelect } from "./StaffLocationSelect";

interface WorkInfoTabProps {
  staff?: FrontendBillingStaff;
}

export const WorkInfoTab = React.memo(({ staff }: WorkInfoTabProps) => {
  return (
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
      
      {/* Use our optimized StaffLocationSelect component */}
      <StaffLocationSelect 
        value={staff?.staffLocationId || ""}
        onValueChange={(value) => {
          // Update the hidden input for form submission
          const hiddenInput = document.querySelector('input[name="staffLocationId"]') as HTMLInputElement;
          if (hiddenInput) {
            hiddenInput.value = value;
          }
        }}
      />
      {/* Hidden input for form submission */}
      <input 
        type="hidden" 
        name="staffLocationId" 
        defaultValue={staff?.staffLocationId || ""} 
      />
      
      {/* Keep the legacy location field for backward compatibility */}
      <div className="space-y-2">
        <Label htmlFor="location">Legacy Location (Deprecated)</Label>
        <Input 
          type="text" 
          id="location" 
          name="location" 
          placeholder="Legacy location text (deprecated)" 
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
  );
});

WorkInfoTab.displayName = "WorkInfoTab";
