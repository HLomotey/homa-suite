import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { jobOrderData } from "../data/operations-data";

export function JobOrdersTrend() {
  return (
    <ChartContainer
      config={{
        total: {
          label: "Total Orders",
          color: "#3b82f6",
        },
        filled: {
          label: "Filled Orders",
          color: "#10b981",
        },
        pending: {
          label: "Pending Orders",
          color: "#f59e0b",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={jobOrderData}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="filled" fill="#10b981" />
          <Bar dataKey="pending" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
