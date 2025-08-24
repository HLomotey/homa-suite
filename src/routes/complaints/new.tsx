/**
 * New complaint form page
 */

import { useNavigate } from "react-router-dom";
import { ComplaintForm } from "@/components/complaints";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/routes/constants";

export default function NewComplaintPage() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(ROUTES.COMPLAINTS);
  };
  
  const handleSuccess = (id: string) => {
    navigate(`/complaints/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Complaints
        </Button>
        <h1 className="text-3xl font-bold">Submit New Complaint</h1>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <ComplaintForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
