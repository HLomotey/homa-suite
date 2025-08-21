import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrontendBillingStaff } from "@/integration/supabase/types/billing";

interface EEODataTabProps {
  staff?: FrontendBillingStaff;
}

export const EEODataTab = React.memo(({ staff }: EEODataTabProps) => {
  return (
    <>
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
    </>
  );
});

EEODataTab.displayName = "EEODataTab";
