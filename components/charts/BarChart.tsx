import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface BarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    color: string;
    name?: string;
    stackId?: string;
  }[];
  xAxisDataKey: string;
  xAxisTickFormatter?: (value: any) => string;
  yAxisTickFormatter?: (value: any) => string;
  height?: number;
  referenceLine?: {
    y?: number;
    label?: string;
    color?: string;
  };
  legend?: boolean;
  grid?: boolean;
  isDate?: boolean;
  layout?: 'vertical' | 'horizontal';
  barSize?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisDataKey,
  xAxisTickFormatter,
  yAxisTickFormatter,
  height = 300,
  referenceLine,
  legend = false,
  grid = true,
  isDate = false,
  layout = 'horizontal',
  barSize,
}) => {
  // Default formatters
  const defaultDateFormatter = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch (e) {
      return dateStr;
    }
  };

  const defaultFormatter = (value: any) => value;

  const xAxisFormatter = xAxisTickFormatter || (isDate ? defaultDateFormatter : defaultFormatter);
  const yAxisFormatter = yAxisTickFormatter || defaultFormatter;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
      >
        {grid && <CartesianGrid strokeDasharray="3 3\" stroke="rgba(255,255,255,0.1)" />}
        <XAxis
          dataKey={xAxisDataKey}
          tickFormatter={layout === 'horizontal' ? xAxisFormatter : yAxisFormatter}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          type={layout === 'horizontal' ? 'category' : 'number'}
        />
        <YAxis
          tickFormatter={layout === 'horizontal' ? yAxisFormatter : xAxisFormatter}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          type={layout === 'horizontal' ? 'number' : 'category'}
          dataKey={layout === 'vertical' ? xAxisDataKey : undefined}
        />
        <Tooltip
          formatter={(value: any, name: any) => [yAxisFormatter(value), name]}
          labelFormatter={(label) => (isDate ? format(parseISO(label), 'MMM d, yyyy') : label)}
          contentStyle={{
            backgroundColor: '#1E293B',
            borderColor: '#475569',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: '#E5E7EB', marginBottom: '0.5rem', fontWeight: 600 }}
          itemStyle={{ color: '#F3F4F6', padding: '0.25rem 0' }}
        />
        {legend && <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />}
        
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color}
            stackId={bar.stackId}
            barSize={barSize}
            animationDuration={1000}
            animationBegin={index * 200}
          />
        ))}
        
        {referenceLine?.y && layout === 'horizontal' && (
          <ReferenceLine
            y={referenceLine.y}
            stroke={referenceLine.color || '#FF6B6B'}
            strokeDasharray="3 3"
            label={{
              value: referenceLine.label,
              position: 'right',
              fill: referenceLine.color || '#FF6B6B',
            }}
          />
        )}
        
        {referenceLine?.y && layout === 'vertical' && (
          <ReferenceLine
            x={referenceLine.y}
            stroke={referenceLine.color || '#FF6B6B'}
            strokeDasharray="3 3"
            label={{
              value: referenceLine.label,
              position: 'right',
              fill: referenceLine.color || '#FF6B6B',
            }}
          />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;