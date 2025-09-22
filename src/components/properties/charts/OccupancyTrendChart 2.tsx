import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Define the data structure for the chart
interface OccupancyTrendDataPoint {
  date: string;
  occupancyRate: number;
}

interface OccupancyTrendChartProps {
  data: OccupancyTrendDataPoint[];
}

export const OccupancyTrendChart: React.FC<OccupancyTrendChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
        <XAxis 
          dataKey="date" 
          stroke="#888" 
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#444', opacity: 0.3 }}
        />
        <YAxis 
          stroke="#888" 
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#444', opacity: 0.3 }}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            color: "#fff",
          }}
          formatter={(value) => [`${value}%`, "Occupancy Rate"]}
          labelStyle={{ color: "#aaa" }}
        />
        <Legend wrapperStyle={{ color: "#888", fontSize: "12px" }} />
        <Line
          type="monotone"
          dataKey="occupancyRate"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Occupancy Rate"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default OccupancyTrendChart;
