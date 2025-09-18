import React, { useState } from "react";
import { ComplaintList } from "./ComplaintList";
import { SlideInComplaintForm } from "./SlideInComplaintForm";
import { useToast } from "@/components/ui/use-toast";

export function ComplaintsManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    toast({
      title: "Complaint submitted",
      description: "Your complaint has been successfully submitted.",
      variant: "default",
    });
  };

  return (
    <div className="relative w-full">
      <ComplaintList onCreateNew={handleOpenForm} />

      <SlideInComplaintForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
