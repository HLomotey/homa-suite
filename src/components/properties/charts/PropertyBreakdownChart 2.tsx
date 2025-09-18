import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

// Define the data structure for the chart
interface PropertyBreakdownDataPoint {
  propertyName: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
}

interface PropertyBreakdownChartProps {
  data: PropertyBreakdownDataPoint[];
}

export const PropertyBreakdownChart: React.FC<PropertyBreakdownChartProps> = ({ data }) => {
  // Colors for the bars
  const occupiedColor = "#8884d8";
  const totalColor = "#82ca9d";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
        barGap={0}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
        <XAxis 
          dataKey="propertyName" 
          stroke="#888" 
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#444', opacity: 0.3 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          stroke="#888" 
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#444', opacity: 0.3 }}
          yAxisId="left"
        />
        <YAxis 
          stroke="#888" 
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#444', opacity: 0.3 }}
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            color: "#fff",
          }}
          formatter={(value, name) => {
            if (name === "Occupancy Rate") return [`${value}%`, name];
            return [value, name];
          }}
          labelStyle={{ color: "#aaa" }}
        />
        <Legend wrapperStyle={{ color: "#888", fontSize: "12px" }} />
        <Bar 
          dataKey="totalRooms" 
          fill={totalColor} 
          name="Total Rooms"
          yAxisId="left"
        />
        <Bar 
          dataKey="occupiedRooms" 
          fill={occupiedColor} 
          name="Occupied Rooms"
          yAxisId="left"
        />
        <Bar 
          dataKey="occupancyRate" 
          fill="#ff8042" 
          name="Occupancy Rate"
          yAxisId="right"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PropertyBreakdownChart;
