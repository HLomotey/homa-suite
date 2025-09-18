import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface VarianceTrendData {
  date: string;
  variance: number;
  projections: number;
}

interface VarianceTrendChartProps {
  data: VarianceTrendData[];
}

const VarianceTrendChart: React.FC<VarianceTrendChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const varianceData = payload.find((p: any) => p.dataKey === 'variance');
      const projectionsData = payload.find((p: any) => p.dataKey === 'projections');
      
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white font-medium">{label}</p>
          {varianceData && (
            <p className="text-white/80">
              Variance: <span className={`font-semibold ${varianceData.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {varianceData.value > 0 ? '+' : ''}{varianceData.value.toFixed(1)}%
              </span>
            </p>
          )}
          {projectionsData && (
            <p className="text-white/80">
              Projections: <span className="font-semibold">{projectionsData.value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          tickFormatter={formatXAxisLabel}
        />
        <YAxis 
          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 2" />
        <Line 
          type="monotone" 
          dataKey="variance" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default VarianceTrendChart;
