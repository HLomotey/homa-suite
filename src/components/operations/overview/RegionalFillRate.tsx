import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { fillRateData } from "../data/operations-data";

export function RegionalFillRate() {
  return (
    <ChartContainer
      config={{
        fillRate: {
          label: "Fill Rate (%)",
          color: "#8b5cf6",
        },
        placements: {
          label: "Placements",
          color: "#06b6d4",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={fillRateData}>
          <XAxis dataKey="region" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="fillRate" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
