import { Outlet } from "react-router-dom";
import { MaintenanceHeader } from "@/components/maintenance/MaintenanceHeader";

export default function MaintenanceLayout() {
  return (
    <div className="flex flex-col h-full">
      <MaintenanceHeader />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
