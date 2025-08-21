import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FrontendBillingStaff } from "@/integration/supabase/types/billing";

interface CompensationTabProps {
  staff?: FrontendBillingStaff;
}

export const CompensationTab = React.memo(({ staff }: CompensationTabProps) => {
  return (
    <>
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
    </>
  );
});

CompensationTab.displayName = "CompensationTab";
