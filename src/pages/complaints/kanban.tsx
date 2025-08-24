/**
 * Complaints Kanban board page
 */

import { useNavigate } from "react-router-dom";
import { ComplaintKanban } from "@/components/complaints";

export default function ComplaintsKanbanPage() {
  const navigate = useNavigate();
  
  const handleViewDetail = (id: string) => {
    navigate(`/complaints/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <ComplaintKanban 
        onViewDetail={handleViewDetail} 
      />
    </div>
  );
}
