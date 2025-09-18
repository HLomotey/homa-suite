import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrontendBillingStaff, BillType } from "../../integration/supabase/types/billing";

interface BillingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: FrontendBillingStaff[];
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

export function BillingForm({ open, onOpenChange, staff, onSubmit, isLoading = false }: BillingFormProps) {
  console.log('BillingForm - staff data:', staff);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const data = {
      staffId: formData.get('staffId') as string,
      amount: parseFloat(formData.get('amount') as string),
      type: formData.get('type') as string,
      dueDate: formData.get('dueDate') as string,
      description: formData.get('description') as string,
      status: 'pending'
    };
    
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>New Bill</SheetTitle>
          <SheetDescription>
            Create a new bill for staff.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="staffId">Staff Member</Label>
            <Select name="staffId" defaultValue="">
              <SelectTrigger id="staffId">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff && staff.length > 0 ? (
                  staff.map((staffMember) => (
                    <SelectItem key={staffMember.id} value={staffMember.id}>
                      {staffMember.legalName || "Unknown Staff"}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="placeholder" disabled>No staff members found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input type="number" id="amount" name="amount" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input type="date" id="dueDate" name="dueDate" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input type="text" id="description" name="description" />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Bill"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
