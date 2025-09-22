import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { jobTypeData } from "../data/operations-data";

export function JobTypesDistribution() {
  return (
    <ChartContainer
      config={{
        count: {
          label: "Count",
          color: "#3b82f6",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={jobTypeData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="count"
            label={({ type, percent }) =>
              `${type} ${percent ? (percent * 100).toFixed(0) : 0}%`
            }
          >
            {jobTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
