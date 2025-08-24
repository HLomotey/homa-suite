/**
 * Complaints module layout component
 */

import { Outlet } from "react-router-dom";

export default function ComplaintsLayout() {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
}
