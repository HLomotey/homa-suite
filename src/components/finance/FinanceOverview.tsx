import { MonthlyRevenue } from "./overview/MonthlyRevenue";
import { GrossMargin } from "./overview/GrossMargin";
import { EBITDA } from "./overview/EBITDA";
import { OperatingExpenses } from "./overview/OperatingExpenses";
import { RevenueProfitTrend } from "./overview/RevenueProfitTrend";
import { RevenueByClient } from "./overview/RevenueByClient";
import { WeeklyCashFlow } from "./overview/WeeklyCashFlow";
import { ExpenseBreakdown } from "./overview/ExpenseBreakdown";

interface FinanceOverviewProps {
  year?: number;
  month?: number;
}

export function FinanceOverview({ year, month }: FinanceOverviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Finance & Accounting Dashboard</h2>
      <p className="text-sm text-muted-foreground">Detailed financial performance and revenue metrics</p>
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MonthlyRevenue year={year} month={month} />
        <GrossMargin year={year} month={month} />
        <EBITDA year={year} month={month} />
        <OperatingExpenses year={year} month={month} />
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueProfitTrend />
        <RevenueByClient />
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyCashFlow />
        <ExpenseBreakdown />
      </div>
    </div>
  );
}
