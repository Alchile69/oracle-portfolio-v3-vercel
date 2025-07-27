import React from 'react';

interface GaugeChartProps {
  value: number;
  min: number;
  max: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  min, 
  max, 
  label, 
  size = 'md' 
}) => {
  const percentage = Math.min(Math.max((value - min) / (max - min) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const getValueColor = (val: number, maximum: number) => {
    const ratio = val / maximum;
    if (ratio < 0.3) return 'text-green-400';
    if (ratio < 0.6) return 'text-yellow-400';
    if (ratio < 0.8) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} mb-2`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${percentage * 2.51} 251`}
            className={getValueColor(value, max)}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Value in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${getValueColor(value, max)} ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
            {value.toFixed(1)}
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">{label}</p>
      </div>
    </div>
  );
};

export default GaugeChart;

