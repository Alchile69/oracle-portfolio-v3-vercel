import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  lines: {
    dataKey: string;
    color: string;
    name?: string;
    strokeWidth?: number;
    dot?: boolean;
  }[];
  xAxisDataKey: string;
  xAxisTickFormatter?: (value: any) => string;
  yAxisTickFormatter?: (value: any) => string;
  height?: number;
  referenceLine?: {
    y?: number;
    x?: string | number;
    label?: string;
    color?: string;
  };
  legend?: boolean;
  grid?: boolean;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  isDate?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisDataKey,
  xAxisTickFormatter,
  yAxisTickFormatter,
  height = 300,
  referenceLine,
  legend = false,
  grid = true,
  margin = { top: 5, right: 20, bottom: 20, left: 0 },
  isDate = true,
}) => {
  // Default date formatter if xAxis is a date
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
      <RechartsLineChart
        data={data}
        margin={margin}
      >
        {grid && <CartesianGrid strokeDasharray="3 3\" stroke="rgba(255,255,255,0.1)\" vertical={false} />}
        <XAxis
          dataKey={xAxisDataKey}
          tickFormatter={xAxisFormatter}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis
          tickFormatter={yAxisFormatter}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            borderColor: '#475569',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
          labelStyle={{ color: '#E5E7EB', marginBottom: '0.5rem', fontWeight: 600 }}
          itemStyle={{ color: '#F3F4F6', padding: '0.25rem 0' }}
          formatter={(value: any, name: any) => [yAxisFormatter(value), name]}
          labelFormatter={(label) => (isDate ? format(parseISO(label), 'MMM d, yyyy') : label)}
        />
        {legend && <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />}
        
        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color}
            strokeWidth={line.strokeWidth || 2}
            dot={line.dot === false ? false : { fill: line.color, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            animationDuration={1500}
            isAnimationActive={true}
          />
        ))}
        
        {referenceLine?.y && (
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
        
        {referenceLine?.x && (
          <ReferenceLine
            x={referenceLine.x}
            stroke={referenceLine.color || '#FF6B6B'}
            strokeDasharray="3 3"
            label={{
              value: referenceLine.label,
              position: 'top',
              fill: referenceLine.color || '#FF6B6B',
            }}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;