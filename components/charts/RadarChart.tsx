import React from 'react';
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';

interface RadarChartProps {
  data: any[];
  dataKeys: {
    key: string;
    name: string;
    color: string;
    fillOpacity?: number;
  }[];
  nameKey: string;
  height?: number;
  maxValue?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  dataKeys,
  nameKey,
  height = 300,
  maxValue,
  showGrid = true,
  showLegend = true,
}) => {
  return (
    <ResponsiveContainer width="100%\" height={height}>
      <RechartsRadarChart
        cx="50%"
        cy="50%"
        outerRadius="80%"
        data={data}
      >
        {showGrid && <PolarGrid stroke="rgba(255,255,255,0.1)" />}
        <PolarAngleAxis 
          dataKey={nameKey} 
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
        />
        {maxValue && (
          <PolarRadiusAxis
            angle={30}
            domain={[0, maxValue]}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
        )}
        
        {dataKeys.map((dataKey, index) => (
          <Radar
            key={index}
            name={dataKey.name}
            dataKey={dataKey.key}
            stroke={dataKey.color}
            fill={dataKey.color}
            fillOpacity={dataKey.fillOpacity || 0.3}
            animationDuration={1000}
            animationBegin={index * 200}
          />
        ))}
        
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            borderColor: '#475569',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: '#F3F4F6' }}
          labelStyle={{ color: '#E5E7EB', fontWeight: 600 }}
        />
        
        {showLegend && (
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: 12,
              padding: '20px 0 0',
            }}
          />
        )}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;