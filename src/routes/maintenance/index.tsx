import { Outlet } from "react-router-dom";
import { MaintenanceHeader } from "@/components/maintenance/MaintenanceHeader";
import { MaintenanceNav } from "@/components/maintenance/MaintenanceNav";

export default function MaintenanceLayout() {
  return (
    <div className="flex flex-col h-full">
      <MaintenanceHeader />
      <div className="flex-1 p-6">
        <MaintenanceNav />
        <Outlet />
      </div>
    </div>
  );
}
