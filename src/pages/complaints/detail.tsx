/**
 * Complaint detail page
 */

import { useParams, useNavigate } from "react-router-dom";
import { ComplaintDetail } from "@/components/complaints";
import { ROUTES } from "@/routes/constants";

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(ROUTES.COMPLAINTS);
  };
  
  if (!id) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Complaint ID not found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ComplaintDetail id={id} onBack={handleBack} />
    </div>
  );
}
