import React from 'react';
import { motion } from 'framer-motion';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  suffix?: string;
  colorScheme?: 'default' | 'reverse' | 'gradient';
  labelPosition?: 'top' | 'bottom';
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  label,
  size = 'md',
  showValue = true,
  suffix = '',
  colorScheme = 'default',
  labelPosition = 'bottom',
}) => {
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max((value - min) / (max - min), 0), 1);
  
  // Calculate angles (in degrees)
  const startAngle = -90;
  const endAngle = 90;
  const valueAngle = startAngle + normalizedValue * (endAngle - startAngle);
  
  // Size configuration
  const sizes = {
    sm: { width: 100, height: 50, thickness: 6, fontSize: 'text-sm' },
    md: { width: 160, height: 80, thickness: 8, fontSize: 'text-base' },
    lg: { width: 200, height: 100, thickness: 10, fontSize: 'text-lg' },
  };
  
  const { width, height, thickness, fontSize } = sizes[size];
  const radius = height * 0.8;
  const cx = width / 2;
  const cy = height;
  
  // Calculate path coordinates
  const getCoordinates = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    const x = cx + radius * Math.cos(radians);
    const y = cy + radius * Math.sin(radians);
    return { x, y };
  };
  
  const start = getCoordinates(startAngle);
  const end = getCoordinates(valueAngle);
  
  // Arc path
  const largeArcFlag = valueAngle - startAngle <= 180 ? 0 : 1;
  
  const pathBackground = `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${getCoordinates(endAngle).x} ${getCoordinates(endAngle).y}
  `;
  
  const pathValue = `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
  `;
  
  // Determine color based on value and color scheme
  const getColor = () => {
    if (colorScheme === 'gradient') {
      return 'url(#gaugeGradient)';
    }
    
    const isReverse = colorScheme === 'reverse';
    
    if (normalizedValue < 0.25) {
      return isReverse ? 'var(--color-secondary-500)' : 'var(--color-green-500)';
    } else if (normalizedValue < 0.5) {
      return isReverse ? 'var(--color-orange-500)' : 'var(--color-info-500)';
    } else if (normalizedValue < 0.75) {
      return isReverse ? 'var(--color-info-500)' : 'var(--color-orange-500)';
    } else {
      return isReverse ? 'var(--color-green-500)' : 'var(--color-secondary-500)';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {label && labelPosition === 'top' && (
        <div className="text-gray-400 mb-2 text-sm">{label}</div>
      )}
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-green-500)" />
              <stop offset="50%" stopColor="var(--color-accent-500)" />
              <stop offset="100%" stopColor="var(--color-secondary-500)" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d={pathBackground}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <motion.path
            d={pathValue}
            fill="none"
            stroke={getColor()}
            strokeWidth={thickness}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: normalizedValue }}
            transition={{ duration: 1, type: 'spring' }}
          />
          
          {/* Center dot */}
          <circle cx={cx} cy={cy} r={thickness / 2} fill="rgba(255, 255, 255, 0.5)" />
        </svg>
        
        {showValue && (
          <motion.div 
            className={`absolute inset-0 flex items-center justify-center ${fontSize} font-bold text-white`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ top: size === 'sm' ? '-5px' : size === 'md' ? '-10px' : '-15px' }}
          >
            {`${value}${suffix}`}
          </motion.div>
        )}
      </div>
      {label && labelPosition === 'bottom' && (
        <div className="text-gray-400 mt-2 text-sm">{label}</div>
      )}
    </div>
  );
};

export default GaugeChart;