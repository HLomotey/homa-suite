import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        name: formData.get('name') as string,
        department: formData.get('department') as string
      };
      
      onSubmit(data);
    } else {
      // For creating new staff
      const data: Omit<FrontendBillingStaff, "id"> = {
        name: formData.get('name') as string,
        department: formData.get('department') as string
      };
      
      onSubmit(data);
    }
    
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Staff Member" : "New Staff Member"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Edit staff member details." : "Add a new staff member."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Staff member name" 
              defaultValue={staff?.name || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
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
              </SelectContent>
            </Select>
          </div>
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
        </form>
      </SheetContent>
    </Sheet>
  );
}
