/**
 * Complaints module layout component
 */

import { Outlet } from "react-router-dom";

export default function ComplaintsLayout() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Outlet />
    </div>
  );
}
