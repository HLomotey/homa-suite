import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriorityDistributionData {
  priority: string;
  count: number;
  percentage: number;
}

interface PriorityDistributionChartProps {
  data: PriorityDistributionData[];
}

const PRIORITY_COLORS = {
  'LOW': '#10b981',
  'MEDIUM': '#3b82f6',
  'HIGH': '#f59e0b',
  'URGENT': '#ef4444'
};

const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label} Priority</p>
          <p className="text-sm text-gray-600">Count: {data.count}</p>
          <p className="text-sm text-gray-600">Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No priority distribution data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="priority" 
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Bar 
                key={`bar-${index}`}
                dataKey="count"
                fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS] || '#8884d8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriorityDistributionChart;
