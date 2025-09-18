/**
 * Example usage of the SlideInComplaintForm component
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { SlideInComplaintForm } from "./SlideInComplaintForm";
import { useToast } from "@/components/ui/use-toast";

export function ComplaintFormExample() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (id: string) => {
    toast({
      title: "Complaint Submitted",
      description: `Your complaint has been successfully submitted with ID: ${id}`,
    });
    setIsFormOpen(false);
  };

  return (
    <div>
      <Button 
        onClick={() => setIsFormOpen(true)}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        New Complaint
      </Button>

      <SlideInComplaintForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
