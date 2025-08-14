import * as React from "react";
import { ClickLogsViewer } from "@/components/analytics/ClickLogsViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ClickLogsTab() {
  return (
    <Card className="border-white/10 bg-black/40">
      <CardHeader>
        <CardTitle className="text-white">Click Logs</CardTitle>
        <CardDescription className="text-white/60">
          View and analyze user interaction data across the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[calc(100vh-300px)]">
          <ClickLogsViewer />
        </div>
      </CardContent>
    </Card>
  );
}
