import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Define the data structure for the chart
interface StatusDistributionDataPoint {
  status: string;
  value: number;
  color: string;
}

interface StatusDistributionChartProps {
  data: StatusDistributionDataPoint[];
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          nameKey="status"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            color: "#fff",
          }}
          labelStyle={{ color: "#aaa" }}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center" 
          wrapperStyle={{ color: "#888", fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusDistributionChart;
