import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

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
        <Tabs
          value={
            path.includes("/maintenance/requests")
              ? "requests"
              : path.includes("/maintenance/report")
              ? "report"
              : path.includes("/maintenance/admin")
              ? "admin"
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
              case "report":
                navigate("/maintenance/report");
                break;
              case "admin":
                navigate("/maintenance/admin");
                break;
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="report">Report Issue</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
