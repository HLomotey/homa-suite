import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LocationDistributionData {
  location: string;
  projections: number;
  revenue: number;
}

interface LocationDistributionChartProps {
  data: LocationDistributionData[];
}

const LocationDistributionChart: React.FC<LocationDistributionChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const projectionsData = payload.find((p: any) => p.dataKey === 'projections');
      const revenueData = payload.find((p: any) => p.dataKey === 'revenue');
      
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white font-medium">{label}</p>
          {projectionsData && (
            <p className="text-blue-400">
              Projections: <span className="font-semibold">{projectionsData.value}</span>
            </p>
          )}
          {revenueData && (
            <p className="text-green-400">
              Revenue: <span className="font-semibold">
                ${revenueData.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="location" 
          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          label={{ value: 'Projections', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          yAxisId="left"
          dataKey="projections" 
          radius={[4, 4, 0, 0]}
          fill="#3b82f6"
          name="Projections"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-projections-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
        <Bar 
          yAxisId="right"
          dataKey="revenue" 
          radius={[4, 4, 0, 0]}
          fill="#10b981"
          name="Revenue"
          fillOpacity={0.7}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-revenue-${index}`} fill={colors[(index + 1) % colors.length]} fillOpacity={0.7} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LocationDistributionChart;
