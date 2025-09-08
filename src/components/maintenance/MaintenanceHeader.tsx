import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { MaintenanceRequestSheet } from "./MaintenanceRequestSheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function MaintenanceHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="border-b border-border">
      <div className="container flex flex-col items-start justify-between py-4 md:flex-row md:items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Manage maintenance requests and track their progress
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <MaintenanceRequestSheet>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </MaintenanceRequestSheet>
          
          <Tabs
            value={
              path.includes("/maintenance/requests")
                ? "requests"
                : "dashboard"
            }
            className="w-full md:w-auto"
            onValueChange={(value) => {
              switch (value) {
                case "dashboard":
                  navigate("/maintenance");
                  break;
                case "requests":
                  navigate("/maintenance/requests");
                  break;
              }
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="requests">My Requests</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
