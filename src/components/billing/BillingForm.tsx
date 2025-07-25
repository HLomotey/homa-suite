import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Staff } from "./data";

interface BillingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff[];
  onSubmit: (formData: any) => void;
}

export function BillingForm({ open, onOpenChange, staff, onSubmit }: BillingFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const data = {
      staffId: formData.get('staff') as string,
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Bill</SheetTitle>
          <SheetDescription>
            Create a new bill for staff.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="staff">Staff Member</Label>
            <Select name="staff">
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((staffMember) => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.name}
                  </SelectItem>
                ))}
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
          <Button type="submit" className="w-full">
            Create Bill
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
