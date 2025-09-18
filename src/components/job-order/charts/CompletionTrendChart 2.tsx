import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface CompletionTrendData {
  date: string;
  completed: number;
  created: number;
}

interface CompletionTrendChartProps {
  data: CompletionTrendData[];
}

const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{format(parseISO(label), 'MMM dd, yyyy')}</p>
          <p className="text-sm text-green-600">Completed: {payload[0]?.value || 0}</p>
          <p className="text-sm text-blue-600">Created: {payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No completion trend data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Completed"
          />
          <Line 
            type="monotone" 
            dataKey="created" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Created"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionTrendChart;
