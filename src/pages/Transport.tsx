import * as React from "react";
import TransportDashboard from "@/pages/transport/dashboard";

export default function TransportPage() {
  return (
    <main className="flex-1 h-full">
      <div className="h-full w-full p-4 space-y-4">
        <TransportDashboard />
      </div>
    </main>
  );
}
