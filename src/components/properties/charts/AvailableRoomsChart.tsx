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
interface AvailableRoomsDataPoint {
  date: string;
  availableRooms: number;
  totalRooms: number;
}

interface AvailableRoomsChartProps {
  data: AvailableRoomsDataPoint[];
}

export const AvailableRoomsChart: React.FC<AvailableRoomsChartProps> = ({ data }) => {
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            color: "#fff",
          }}
          labelStyle={{ color: "#aaa" }}
        />
        <Legend wrapperStyle={{ color: "#888", fontSize: "12px" }} />
        <Line
          type="monotone"
          dataKey="availableRooms"
          stroke="#4ade80"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Available Rooms"
        />
        <Line
          type="monotone"
          dataKey="totalRooms"
          stroke="#94a3b8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Total Rooms"
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AvailableRoomsChart;
