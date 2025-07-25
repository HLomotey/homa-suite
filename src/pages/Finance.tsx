import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceOverview } from "@/components/finance/FinanceOverview";
import { FinanceReports } from "@/components/finance/FinanceReports";
import { FinanceTransactions } from "@/components/finance/FinanceTransactions";
import { FinanceBudgeting } from "@/components/finance/FinanceBudgeting";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col space-y-4 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Finance & Accounting Dashboard
        </h1>
        <p className="text-muted-foreground">
          Detailed financial performance and revenue metrics
        </p>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgeting">Budgeting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <FinanceOverview />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <FinanceReports />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <FinanceTransactions />
        </TabsContent>

        <TabsContent value="budgeting" className="mt-6">
          <FinanceBudgeting />
        </TabsContent>
      </Tabs>
    </div>
  );
}
