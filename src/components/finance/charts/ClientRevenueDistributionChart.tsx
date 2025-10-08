import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ClientRevenueData {
  client_name: string;
  total_revenue: number;
  invoice_count: number;
}

interface ClientRevenueDistributionChartProps {
  data: ClientRevenueData[];
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6366f1'  // Indigo
];

const ClientRevenueDistributionChart: React.FC<ClientRevenueDistributionChartProps> = ({ data }) => {
  // Transform data for pie chart
  const chartData = data.map((client, index) => ({
    name: client.client_name,
    value: client.total_revenue,
    fill: COLORS[index % COLORS.length],
    invoices: client.invoice_count
  }));

  const chartConfig = {
    revenue: {
      label: "Revenue",
    },
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg border-gray-200">
          <div className="grid gap-2">
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium">
                Client
              </span>
              <span className="font-bold text-gray-900">
                {data.payload.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium">
                Revenue
              </span>
              <span className="font-bold text-green-600 text-lg">
                ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium">
                Invoices
              </span>
              <span className="font-bold text-blue-600">
                {data.payload.invoices}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No revenue data available</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          stroke="#ffffff"
          strokeWidth={2}
          label={({ name, percent }) => 
            percent > 0.08 ? `${name.length > 12 ? name.substring(0, 12) + '...' : name} ${(percent * 100).toFixed(0)}%` : ''
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
};

export default ClientRevenueDistributionChart;
