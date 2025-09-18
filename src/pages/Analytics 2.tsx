import * as React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClickLogsViewer } from "@/components/analytics/ClickLogsViewer";
import { PageHeader } from "@/components/ui/page-header";

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("click-logs");

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Analytics"
        description="View and analyze user interactions and system usage"
      />

      <Tabs
        defaultValue="click-logs"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 space-y-4"
      >
        <TabsList>
          <TabsTrigger value="click-logs">Click Logs</TabsTrigger>
          <TabsTrigger value="usage-metrics" disabled>Usage Metrics</TabsTrigger>
          <TabsTrigger value="performance" disabled>Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="click-logs" className="flex-1">
          <ClickLogsViewer />
        </TabsContent>
        
        <TabsContent value="usage-metrics" className="flex-1">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Usage metrics coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="flex-1">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Performance analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
