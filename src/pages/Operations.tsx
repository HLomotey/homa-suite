import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { OperationsOverview } from "@/components/operations/OperationsOverview";
import { OperationsJobOrders } from "@/components/operations/OperationsJobOrders";
import { OperationsPerformance } from "@/components/operations/OperationsPerformance";
import { OperationsAnalytics } from "@/components/operations/OperationsAnalytics";

export default function Operations() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Field Operations</h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="job-orders">Job Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OperationsOverview />
        </TabsContent>

        <TabsContent value="job-orders" className="space-y-4">
          <OperationsJobOrders />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <OperationsPerformance />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <OperationsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
