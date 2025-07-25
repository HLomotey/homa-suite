import { useState } from "react";
import { useLocation } from "react-router-dom";
import { UserList } from "./UserList";
import { UserDetail } from "./UserDetail";

export function Users() {
  const location = useLocation();
  const path = location.pathname;
  
  // Determine which component to render based on the current path
  const renderComponent = () => {
    if (path.includes("/users/new") || path.match(/\/users\/[^/]+$/)) {
      return <UserDetail />;
    }
    return <UserList />;
  };

  return (
    <div className="container mx-auto py-6">
      {renderComponent()}
    </div>
  );
}
