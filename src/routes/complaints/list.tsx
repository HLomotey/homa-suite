/**
 * Complaints list page
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintList } from "@/components/complaints";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ROUTES } from "@/routes/constants";

export default function ComplaintsListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  
  const handleCreateNew = () => {
    navigate(ROUTES.COMPLAINTS_NEW);
  };
  
  const handleViewDetail = (id: string) => {
    navigate(`/complaints/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Complaints Management</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Complaint
        </Button>
      </div>
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <ComplaintList onCreateNew={handleCreateNew} onViewDetail={handleViewDetail} />
        </TabsContent>
        <TabsContent value="kanban" className="mt-6">
          <div className="flex justify-center items-center p-12 border rounded-lg">
            <p className="text-muted-foreground">
              Kanban view will be available here. Navigate to /complaints/kanban to see the full Kanban board.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
