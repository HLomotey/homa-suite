/**
 * Complaints Kanban board page
 */

import { useNavigate } from "react-router-dom";
import { ComplaintKanban } from "@/components/complaints";
import { ROUTES } from "@/routes/constants";

export default function ComplaintsKanbanPage() {
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    navigate(ROUTES.COMPLAINTS_NEW);
  };
  
  const handleViewDetail = (id: string) => {
    navigate(`/complaints/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <ComplaintKanban 
        onCreateNew={handleCreateNew} 
        onViewDetail={handleViewDetail} 
      />
    </div>
  );
}
