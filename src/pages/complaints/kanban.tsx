/**
 * Complaints Kanban board page - Redirects to list page with kanban tab selected
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ComplaintsKanbanPage() {
  const navigate = useNavigate();
  
  // Redirect to the list page with kanban tab selected
  useEffect(() => {
    // Use search params to indicate which tab should be active
    navigate("/complaints?tab=kanban", { replace: true });
  }, [navigate]);
  
  // This component will not render as it immediately redirects
  return null;
}
