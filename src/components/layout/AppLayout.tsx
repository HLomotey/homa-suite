import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <div className="z-50">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto relative">
        <Outlet />
      </div>
    </div>
  );
}
