import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { timeToFillData } from "../data/operations-data";

export function TimeToFillTrend() {
  return (
    <ChartContainer
      config={{
        avgDays: {
          label: "Avg Days",
          color: "#ef4444",
        },
        target: {
          label: "Target",
          color: "#10b981",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={timeToFillData}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="avgDays"
            stroke="#ef4444"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
