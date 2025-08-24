/**
 * Complaints list page
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ComplaintList, ComplaintKanban } from "@/components/complaints";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ComplaintsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "list");
  
  // Update the URL when the tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams(value === "list" ? {} : { tab: value });
  };
  
  // Listen for URL changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && (tabParam === "list" || tabParam === "kanban")) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  const handleViewDetail = (id: string) => {
    navigate(`/complaints/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Complaints Management</h1>
      </div>
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <ComplaintList onViewDetail={handleViewDetail} />
        </TabsContent>
        <TabsContent value="kanban" className="mt-6">
          <ComplaintKanban onViewDetail={handleViewDetail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
