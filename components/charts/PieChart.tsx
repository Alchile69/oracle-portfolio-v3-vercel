import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: DataPoint[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  height?: number;
  showLabel?: boolean;
  showLegend?: boolean;
  legendPosition?: 'bottom' | 'right';
  dataKey?: string;
  nameKey?: string;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  colors?: string[];
}

const COLORS = [
  '#2DD4BF', '#3B82F6', '#FFC107', '#FF6B6B', '#A78BFA',
  '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#EC4899'
];

const PieChart: React.FC<PieChartProps> = ({
  data,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 2,
  height = 300,
  showLabel = false,
  showLegend = true,
  legendPosition = 'bottom',
  dataKey = 'value',
  nameKey = 'name',
  tooltipFormatter,
  colors = COLORS,
}) => {
  const renderLabel = ({ name, percent }: { name: string; percent: number }) => {
    return showLabel ? `${name}: ${(percent * 100).toFixed(0)}%` : '';
  };

  const legendLayout = legendPosition === 'bottom' ? 'horizontal' : 'vertical';
  const legendAlign = legendPosition === 'bottom' ? 'center' : 'right';
  const legendVerticalAlign = legendPosition === 'bottom' ? 'bottom' : 'middle';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={showLabel}
          label={renderLabel}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          dataKey={dataKey}
          nameKey={nameKey}
          animationDuration={1000}
          animationBegin={200}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={tooltipFormatter || ((value: number, name: string) => [
            value.toLocaleString(),
            name
          ])}
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
            layout={legendLayout}
            align={legendAlign}
            verticalAlign={legendVerticalAlign}
            iconType="circle"
            wrapperStyle={{
              fontSize: 12,
              padding: legendPosition === 'bottom' ? '20px 0 0' : '0 0 0 10px',
            }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;