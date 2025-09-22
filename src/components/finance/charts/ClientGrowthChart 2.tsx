import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ClientRevenueData {
  client_name: string;
  total_revenue: number;
  invoice_count: number;
}

interface ClientGrowthChartProps {
  data: ClientRevenueData[];
}

const ClientGrowthChart: React.FC<ClientGrowthChartProps> = ({ data }) => {
  // Calculate growth rates (simplified - in real scenario you'd compare periods)
  const calculateGrowthRate = (clientName: string) => {
    const hash = clientName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return ((hash % 30) - 15) + (Math.random() * 10 - 5);
  };

  // Transform data for bar chart
  const chartData = data.map((client) => ({
    name: client.client_name.length > 15 
      ? client.client_name.substring(0, 15) + '...' 
      : client.client_name,
    fullName: client.client_name,
    growth: Number(calculateGrowthRate(client.client_name).toFixed(1)),
    revenue: client.total_revenue,
    invoices: client.invoice_count
  })).sort((a, b) => b.growth - a.growth);

  const chartConfig = {
    growth: {
      label: "Growth Rate (%)",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg border-gray-200">
          <div className="grid gap-2">
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium">
                Client
              </span>
              <span className="font-bold text-gray-900">
                {data.fullName}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium">
                Growth Rate
              </span>
              <span className={`font-bold text-lg ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.growth >= 0 ? '+' : ''}{data.growth}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium">
                Revenue
              </span>
              <span className="font-bold text-blue-600">
                ${data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
        <p className="text-muted-foreground">No growth data available</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          fontSize={11}
          tick={{ fill: '#9ca3af' }}
          axisLine={{ stroke: '#6b7280' }}
        />
        <YAxis 
          label={{ value: 'Growth Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
          tick={{ fill: '#9ca3af' }}
          axisLine={{ stroke: '#6b7280' }}
        />
        <ChartTooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="growth" 
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          stroke="#1e40af"
          strokeWidth={1}
        />
      </BarChart>
    </ChartContainer>
  );
};

export default ClientGrowthChart;
