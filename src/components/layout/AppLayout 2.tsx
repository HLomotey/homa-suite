import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <div className="flex h-screen w-full bg-background">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} transition-all duration-300 flex-shrink-0 md:block ${!sidebarOpen && 'hidden'}`}>
        <Sidebar collapsed={!sidebarOpen} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
