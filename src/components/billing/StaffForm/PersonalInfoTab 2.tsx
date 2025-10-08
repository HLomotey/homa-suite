import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FrontendBillingStaff } from "@/integration/supabase/types/billing";

interface PersonalInfoTabProps {
  staff?: FrontendBillingStaff;
}

export const PersonalInfoTab = React.memo(({ staff }: PersonalInfoTabProps) => {
  return (
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
  );
});

PersonalInfoTab.displayName = "PersonalInfoTab";
