import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
}
